import React from "react";
import { useHistory } from "react-router";
import "./Carrito.css";
import prueba from "./Prueba.json";

const Carrito = ({ onEdit }) => {
  const history = useHistory();
  return (
    <div className="contenedor-pedidos">
      <table className="tabla-pedidos">
        <thead>
          <tr>
            <th>PRODUCTO</th>
            <th>CANTIDAD</th>
          </tr>
        </thead>
        <tbody>
          {prueba.map(({ producto, cantidad, unidad, descripcion }, index) => (
            <tr key={index}>
              <td>
                <span>{producto}</span>
              </td>
              <td className="contenedor-flex">
                <span>{`${cantidad} ${unidad}`}</span>
                <span className="botones">
                  <i
                    onClick={onEdit({
                      producto,
                      cantidad,
                      unidad,
                      descripcion,
                    })}
                    className="fas fa-edit icono"></i>
                  <i className="fas fa-window-close icono-cancel"></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="contenedor-botones">
        <button className="btn">Confirmar</button>
        <button
          onClick={() => {
            history.push("/Lista");
          }}
          className="btn">
          Volver a la Lista
        </button>
      </div>
    </div>
  );
};

export default Carrito;
