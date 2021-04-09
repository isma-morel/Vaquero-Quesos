import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./EstadoPedidos.css";

const procesarPedidos = (pedidosBruto) => {
  let pedidosProcesados = [];
  pedidosProcesados = pedidosBruto.reduce(
    (
      acum,
      {
        Pedido,
        Cliente,
        Codigo,
        Producto,
        Presentacion,
        CantidadAPreparar,
        CantidadPedida,
        CantidadPreparados,
        Medida,
        Avance,
      }
    ) => {
      let pedidoTemp = {};
      let index = acum.findIndex((pedido) => pedido.Pedido === Pedido);

      if (index < 0) {
        pedidoTemp = {
          Pedido,
          Cliente,
          Productos: [
            {
              Codigo,
              Producto,
              Presentacion,
              CantidadAPreparar,
              CantidadPedida,
              CantidadPreparados,
              Medida,
              Avance,
            },
          ],
        };
        return [...acum, pedidoTemp];
      }

      acum[index].Productos.push({
        Codigo,
        Producto,
        Presentacion,
        CantidadAPreparar,
        CantidadPedida,
        CantidadPreparados,
        Medida,
        Avance,
      });
      return [...acum];
    },
    []
  );

  return pedidosProcesados;
};
const filtrarPedidoPorId = (id, pedidos) => {
  return pedidos.filter((pedido) => pedido.Pedido.toString().startsWith(id));
};

const filtrarPedidoPorCliente = (cliente, pedidos) => {
  return pedidos.filter((pedido) => pedido.Cliente.includes(cliente));
};

const filtrar = (value, pedidos) => {
  const esNumero = /^[0-9]+$/;
  let resultado = pedidos;
  if (value.match(esNumero)) {
    resultado = filtrarPedidoPorId(value, pedidos);
  } else {
    resultado = filtrarPedidoPorCliente(value, pedidos);
  }
  return resultado;
};

const EstadoPedidos = () => {
  const [pedidos, setPedidos] = useState();
  const [pedidosFiltrados, setPediosFiltrados] = useState();
  const { push } = useHistory();
  const obtenerEstadoPedidos = async () => {
    const auth = JSON.parse(localStorage.getItem("auth")) || {};
    let pedidosProcesados;
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosPorEstado?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          localStorage.removeItem("auth");
          push("/");
        }
        throw new Error("ah ocurrido un error");
      }

      const json = await result.json();
      pedidosProcesados = procesarPedidos(json);
      setPedidos(pedidosProcesados);
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const handleChangeFiltro = (e) => {
    const resultado = filtrar(e.target.value, pedidos);
    if (!resultado) return;
    setPediosFiltrados(resultado);
  };
  useEffect(() => {
    obtenerEstadoPedidos();
  }, []);
  useEffect(() => {
    setPediosFiltrados(pedidos);
  }, [pedidos]);
  return (
    <div className="estado">
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            onChange={handleChangeFiltro}
            placeholder="Filtro"
          />
          <span className="titulo">Estado de Pedidos</span>
        </div>
        <hr />
      </div>
      {pedidos ? (
        pedidosFiltrados?.map(({ Pedido, Cliente, Productos }, index) => (
          <div key={Pedido} className="contenedor-tabla">
            <div className="contenedor-cliente">
              <div className="datos">
                <span>Cliente: {Cliente}</span>
                <span>Pedido: {Pedido}</span>
              </div>
            </div>
            <table className="tabla tabla-pedidos">
              <thead>
                <tr>
                  <th>CODIGO</th>
                  <th>PRESENTACION</th>
                  <th>CANT. PEDIDA</th>
                  <th>CANT. A PREPARAR</th>
                  <th>CANT. LISTA</th>
                  <th>MEDIDA</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {Productos.map(
                  (
                    {
                      Codigo,
                      Producto,
                      Presentacion,
                      CantidadAPreparar,
                      CantidadPedida,
                      CantidadPreparados,
                      Medida,
                      Avance,
                    },
                    indexProd
                  ) => (
                    <tr key={indexProd}>
                      <td>{Codigo}</td>
                      <td>
                        <div>
                          <span className="titulo">{Producto}</span>
                        </div>
                      </td>
                      <td className="peso">{`${CantidadPedida}`}</td>
                      <td>{CantidadAPreparar}</td>
                      <td>{CantidadPreparados}</td>
                      <td>{Medida}</td>
                      <td>{`${Avance}%`}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div className="spin"></div>
      )}
    </div>
  );
};

export default EstadoPedidos;
