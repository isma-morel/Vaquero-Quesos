import React, { useEffect, useState } from "react";
import "./Pedidos.css";
import { BASE_URL } from "../../BaseURL.json";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
const ProcesarPedido = (pedidos) => {
  if (pedidos.length === 0) return [];
  const pedido = pedidos.reduce(
    (
      acum,
      {
        IdPedido,
        Pedido,
        Cliente,
        IdProducto,
        Codigo,
        Presentacion,
        Cantidad,
        CantidadPreparar,
        idPedidosProd,
        Medida,
        IdMedidaPrinc,
      }
    ) => {
      if (acum.length === 0) {
        return [
          {
            IdPedido,
            Pedido,
            Cliente,
            Productos: [
              {
                IdProducto,
                Codigo,
                Presentacion,
                Cantidad,
                CantidadPreparar,
                idPedidosProd,
                Medida,
                IdMedidaPrinc,
              },
            ],
          },
        ];
      }
      let indexPedido = acum.findIndex((elem) => elem.IdPedido === IdPedido);
      if (indexPedido < 0) {
        return [
          ...acum,
          {
            IdPedido,
            Pedido,
            Cliente,
            Productos: [
              {
                IdProducto,
                Codigo,
                Presentacion,
                Cantidad,
                CantidadPreparar,
                idPedidosProd,
                Medida,
                IdMedidaPrinc,
              },
            ],
          },
        ];
      }
      acum[indexPedido].Productos.push({
        IdProducto,
        Codigo,
        Presentacion,
        Cantidad,
        CantidadPreparar,
        idPedidosProd,
        Medida,
        IdMedidaPrinc,
      });
      return [...acum];
    },
    []
  );
  return pedido;
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

const GuardarConfirmados = async (Preparados, usuario, Token) => {
  if (Preparados.length === 0) return;
  let PedidosPreparados = { PedidosAPrepararTodos: Preparados };
  try {
    const result = await fetch(
      `${BASE_URL}iPedidosSP/APrepararGuardar?pUsuario=${usuario}&pToken=${Token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(PedidosPreparados),
      }
    );
    if (result.status !== 200) {
      throw new Error(result.statusText);
    }
  } catch (err) {
    console.log(err);
  }
};

const obtenerPedidosAConfirmar = (pedidos) => {
  let Preparados = [];
  pedidos.map(({ Productos }) => {
    Productos.map(({ CantidadPreparar, idPedidosProd, IdMedidaPrinc }) => {
      if (CantidadPreparar > 0) {
        Preparados.push({
          idPedidosProd,
          IdMedidaPrinc,
          CantidadPrinc: CantidadPreparar,
        });
      }
    });
  });

  return Preparados;
};

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const { push } = useHistory();
  const PedirPedidos = async () => {
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    if (!Token) return;

    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosPendientes?pUsuario=${usuario}&pToken=${Token}`
      );

      if (result.status !== 200) {
        throw new Error(result.statusText);
      }

      const json = await result.json();

      const pedidoProcesado = await ProcesarPedido(json);

      setPedidos(pedidoProcesado);
    } catch (err) {
      console.log(err.message);
    }
  };
  const handleConfirmar = (e) => {
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    let Preparados = obtenerPedidosAConfirmar(pedidos);
    GuardarConfirmados(Preparados, usuario, Token).then((result) => {
      setPedidos([]);
      PedirPedidos();
      toast.success("pedidos confirmados con exito");
    });
  };
  const handleChangeFiltro = (e) => {
    const resultado = filtrar(e.target.value, pedidos);
    if (!(resultado && resultado.length > 0)) return;
    setPedidosFiltrados(resultado);
  };
  const handleChangeCantidad = (index, indexProd) => (e) => {
    const { target } = e;
    let pedidosTemp = pedidosFiltrados;
    pedidosTemp[index].Productos[indexProd].CantidadPreparar = parseInt(
      target.value
    );

    setPedidosFiltrados([...pedidosTemp]);
  };
  /* Efecto encargado de actualizar la lista de pedidos que se va a renderizar */
  useEffect(() => {
    setPedidosFiltrados(pedidos);
  }, [pedidos]);
  /* Efecto encargado de realizar la peticion de la lista  */
  useEffect(() => {
    PedirPedidos();
  }, []);

  return (
    <div className="pedidos">
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />

          <button onClick={handleConfirmar} className="btn">
            Confirmar preparacion
          </button>
        </div>
        <hr />
      </div>
      {pedidos.length > 0 ? (
        pedidosFiltrados.map(({ Cliente, Pedido, Productos }, index) => (
          <div key={index} className="contenedor-tabla">
            <div className="contenedor-cliente">
              <span>
                Cliente: {Cliente} - Pedido: {Pedido}
              </span>
            </div>
            <table className="tabla tabla-pedidos">
              <thead>
                <tr>
                  <th>CODIGO</th>
                  <th>PRESENTACIÓN</th>
                  <th>CANTIDAD PEDIDA</th>
                  <th>CANTIDAD A PREPARAR</th>
                </tr>
              </thead>
              <tbody>
                {Productos?.map(
                  (
                    {
                      Codigo,
                      Presentacion,
                      Cantidad,
                      Medida,
                      CantidadPreparar,
                    },
                    indexProd
                  ) => (
                    <tr key={indexProd}>
                      <td>{Codigo}</td>
                      <td>
                        <div>
                          <span className="titulo">{Presentacion}</span>
                        </div>
                      </td>
                      <td>{`${Cantidad}${Medida || ""}`}</td>
                      <td className="cantidad-preparar">
                        <input
                          value={CantidadPreparar}
                          type="number"
                          max={Cantidad}
                          min={0}
                          onChange={handleChangeCantidad(index, indexProd)}
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <hr />
          </div>
        ))
      ) : (
        <div className="spin"></div>
      )}
    </div>
  );
};

export default Pedidos;
