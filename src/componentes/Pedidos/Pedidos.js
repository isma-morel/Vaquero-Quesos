import React from "react";
import "./Pedidos.css";
import pedidos from "./Pedidos.json";
const Pedidos = () => {
  return (
    <div className="pedidos">
      {pedidos.map(({ cliente, pedido, prouctos }) => (
        <div className="contenedor-tabla">
          <div className="contenedor-cliente">
            <span>
              Cliente:{cliente} - Pedido:{pedido}
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
              {prouctos.map(
                ({ codigo, presentacion, cantidadPedida, medida }) => (
                  <tr>
                    <td>{codigo}</td>
                    <td className="">
                      <div>
                        <span className="titulo">{presentacion}</span>
                      </div>
                    </td>
                    <td>{`${cantidadPedida}${medida}`}</td>
                    <td className="cantidad-preparar">
                      <input type="number" max={cantidadPedida} min={0} />
                      <i className="far fa-check-square"></i>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Pedidos;
