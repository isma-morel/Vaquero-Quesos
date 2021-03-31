import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../BaseURL.json";
import "./AprepararGuardar.css";

const ProcesarPedido = (pedidos) => {
  let pedidosProcesados = [];
  if (Object.keys(pedidos).length === 0) return [];
  pedidosProcesados = pedidos.Resumido.reduce((acum, actual) => {
    let resultado = {
      ...actual,
      Fecha: new Date(actual.Fecha).toLocaleDateString(),
      Productos: [],
    };
    pedidos.Detallado.forEach(
      ({ IdPedido, idPedidosProd, Codigo, Presentacion, Cantidad, Medida }) => {
        if (actual.IdPedido === IdPedido) {
          resultado.Productos.push({
            idPedidosProd,
            Codigo,
            Presentacion,
            Cantidad,
            Medida,
          });
        }
      }
    );
    return [...acum, resultado];
  }, []);
  return pedidosProcesados;
};

const FiltrarCliente = (cliente, pedidos) => {
  return pedidos.filter((pedido) => pedido.Cliente.includes(cliente));
};
const FiltrarPedido = (id, pedidos) => {
  return pedidos.filter((pedido) => pedido.Pedido.toString().startsWith(id));
};
const Filtrar = (value, pedidos) => {
  const esNumero = /^[0-9]+$/;
  let resultado = pedidos;
  if (value.match(esNumero)) {
    resultado = FiltrarPedido(value, pedidos);
  } else {
    resultado = FiltrarCliente(value, pedidos);
  }
  return resultado;
};
function AprepararGuardar() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const pedirPedidosAPreparar = async () => {
    let pedidosProcesados = [];
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    if (!Token) return;
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosParaPreparar?pUsuario=${usuario}&pToken=${Token}`
      );
      if (result.status !== 200) throw new Error(result.statusText);

      const json = await result.json();
      if (!json?.Resumido) throw new Error("error al obtener los datos");

      pedidosProcesados = await ProcesarPedido(json);

      setPedidos(pedidosProcesados);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeFiltro = (e) => {
    const resultado = Filtrar(e.target.value, pedidos);
    if (!(resultado && resultado.length > 0)) return;
    setPedidosFiltrados(resultado);
  };

  useEffect(() => {
    setPedidosFiltrados(pedidos);
  }, [pedidos]);
  useEffect(() => {
    pedirPedidosAPreparar();
  }, []);

  return (
    <div className="preparar">
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />
        </div>
        <hr />
      </div>
      {pedidos.length > 0 ? (
        pedidosFiltrados.map(({ Cliente, Fecha, Productos, Pedido }, index) => (
          <div key={index} className="contenedor-tabla">
            <div className="contenedor-cliente">
              <div>
                <span>Cliente: {Cliente}</span>

                <span>Pedido: {Pedido}</span>

                <span>Fecha: {Fecha}</span>
              </div>
              <button className="btn">Preparar</button>
            </div>
            <table className="tabla tabla-pedidos">
              <thead>
                <tr>
                  <th>CODIGO</th>
                  <th>PRESENTACION</th>
                  <th>CANTIDAD</th>
                </tr>
              </thead>
              <tbody>
                {Productos?.map(
                  ({ Codigo, Presentacion, Cantidad, Medida }, indexProd) => (
                    <tr key={indexProd}>
                      <td>{Codigo}</td>
                      <td>
                        <span className="titulo">{Presentacion}</span>
                      </td>
                      <td>{`${Cantidad} ${Medida}`}</td>
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
}

export default AprepararGuardar;
