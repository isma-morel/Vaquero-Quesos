import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./EstadoPedidos.css";
import { StateCircle } from "./StateCircle/StateCircle";

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
  return pedidos.filter((pedido) =>
    pedido.Cliente.toLowerCase().includes(cliente.toLowerCase())
  );
};

const filtrarPedidoPorProducto = (producto, pedidos) => {
  let pedidos1 = pedidos.map(({ Cliente, Pedido, Productos }) => {
    const Productos1 = Productos.filter(({ Producto }) =>
      Producto.toLowerCase().includes(producto.toLowerCase())
    );
    const nuevoArrayFiltrar = {
      Cliente,
      Pedido,
      Productos: Productos1,
    };
    return nuevoArrayFiltrar.Productos.length > 0 ? nuevoArrayFiltrar : [];
  });
  pedidos1 = pedidos1.filter((e) => e.length !== 0);
  return pedidos1;
};
const filtrarPedidoPorCodigo = (codigo, pedidos) => {
  let pedidos1 = pedidos.map(({ Cliente, Pedido, Productos }) => {
    const Productos1 = Productos.filter(({ Codigo }) =>
      Codigo.toString().startsWith(codigo)
    );
    const nuevoArrayFiltrar = {
      Cliente,
      Pedido,
      Productos: Productos1,
    };
    return nuevoArrayFiltrar.Productos.length > 0 ? nuevoArrayFiltrar : [];
  });
  pedidos1 = pedidos1.filter((e) => e.length !== 0);
  return pedidos1;
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

const filtrar2 = (value, pedidos) => {
  const esNumero = /^[0-9]+$/;
  let resultado = pedidos;
  if (value.match(esNumero)) {
    resultado = filtrarPedidoPorCodigo(value, pedidos);
  } else {
    resultado = filtrarPedidoPorProducto(value, pedidos);
  }
  return resultado;
};

const EstadoPedidos = ({ idPermiso }) => {
  const [pedidos, setPedidos] = useState();
  const [pedidosFiltrados, setPediosFiltrados] = useState();
  const { push } = useHistory();

  const obtenerEstadoPedidos = async () => {
    const auth = JSON.parse(sessionStorage.getItem("auth")) || {};
    let pedidosProcesados;
    try {
      if (
        !auth.Token ||
        !auth.permisos.some(({ IdMenu }) => IdMenu === idPermiso)
      )
        return push("/");

      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosPorEstado?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );

      if (result.status !== 200) {
        if (result.status === 401) {
          sessionStorage.removeItem("auth");
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
    console.log(pedidos);
    const resultado = filtrar(e.target.value, pedidos);
    if (!resultado) return;
    setPediosFiltrados(resultado);
  };
  const handleChangeFiltro2 = (e) => {
    const resultado = filtrar2(e.target.value, pedidos);
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
          <input
            type="text"
            name="filtro"
            onChange={handleChangeFiltro2}
            placeholder="Filtro Por Producto/Codigo"
          />
          <span className="titulo">Estado de Pedidos</span>
        </div>
        <hr />
      </div>
      {pedidos ? (
        pedidosFiltrados?.map(({ Pedido, Cliente, Productos }, index, e) =>
          e.length > 0 ? (
            <div key={index} className="contenedor-tabla">
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
                  {Productos &&
                    Productos.map(
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
                          <td
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {<StateCircle avance={Avance} />}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          ) : null
        )
      ) : (
        <div className="spin"></div>
      )}
    </div>
  );
};

export default EstadoPedidos;
