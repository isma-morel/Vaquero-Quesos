import useModal from "../../hooks/useModal";
import "./Lista.css";
import productos from "./Productos.json";
import { Modal } from "../../componentes";
import { Redirect } from "react-router";
import { useEffect, useState } from "react";

const BASE_URL = "http://200.89.178.131/LacteosApi/api";

function Lista() {
  const [isOpenModal, handleModal] = useModal();
  const [productoAagregar, SetProductoAagregar] = useState();
  const [productosState, setProductosState] = useState();

  useEffect(() => {
    const pedirLista = async () => {
      const auth = JSON.parse(localStorage.getItem("auth"));
      try {
        const json = await fetch(
          `${BASE_URL}/iProductosSP/ProductosDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
        );
        const result = await json.json();
        setProductosState(result);
      } catch (err) {
        console.log(err);
      }
    };
    pedirLista();
  }, []);
  const handleClick = (producto) => (e) => {
    SetProductoAagregar(producto);
    handleModal();
  };
  return localStorage.getItem("auth") ? (
    <>
      {productoAagregar ? (
        <Modal
          isOpen={isOpenModal}
          onClose={handleModal}
          producto={productoAagregar}
        />
      ) : null}
      {productosState ? (
        <table className="tabla">
          <thead>
            <tr>
              <th>CODIGO</th>
              <th>PRODUCTO</th>
            </tr>
          </thead>
          <tbody>
            {productosState.map((producto, index) => (
              <tr key={index}>
                <td>
                  <span className="codigo">{producto.Codigo}</span>
                </td>
                <td
                  onClick={handleClick(producto)}
                  className={`producto ${producto.TieneFoto ? "confoto" : ""}`}>
                  <div>
                    <span className="titulo">{producto.Descripcion}</span>
                    <span className="descripcion">{producto.Presentacion}</span>
                  </div>
                  {producto.TieneFoto ? (
                    <span className="foto">
                      <i className="fas fa-camera"></i>
                    </span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </>
  ) : (
    <Redirect to="/" />
  );
}

export default Lista;
