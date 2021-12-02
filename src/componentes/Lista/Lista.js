import useModal from "../../hooks/useModal";
import "./Lista.css";
import { Modal } from "../../componentes";
import { Redirect, useHistory } from "react-router";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../BaseURL.json";
import { Link } from "react-router-dom";

function Lista() {
  const [isOpenModal, handleModal] = useModal();
  const [productoAagregar, SetProductoAagregar] = useState();
  const [productosState, setProductosState] = useState();
  const [cantidadProductos, setCantidadProductos] = useState(0);
  const history = useHistory();

  const obtenerCarrito = () => {
    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
    setCantidadProductos(carrito.length);
  };
  const handleCloseModal = (e) => {
    obtenerCarrito();
    handleModal();
  };

  useEffect(() => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    const tipo = {
      S: () => history.push("/Dashboard"),
      V: () => history.push("/"),
    };
    if (auth && auth.TipoCliente !== "C") {
      tipo[auth.TipoCliente]();
      return;
    }

    const pedirLista = async () => {
      if (!auth || !auth.IdCliente) sessionStorage.removeItem("auth");
      try {
        const result = await fetch(
          `${BASE_URL}iProductosSP/ProductosDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
        );
        if (result.status !== 200) {
          if (result.status === 401) {
            sessionStorage.removeItem("auth");
            history.push("/");
          }
          throw new Error("se ha producido un error");
        }
        const json = await result.json();
        json.forEach((productos) => {
          productos.Medidas.splice(0, 1);
        });
        setProductosState(json);
      } catch (err) {
        console.log(err);
      }
    };

    pedirLista();
    obtenerCarrito();
  }, []);
  const handleClick = (producto) => (e) => {
    SetProductoAagregar(producto);
    handleModal();
  };
  return sessionStorage.getItem("auth") ? (
    <>
      {productoAagregar ? (
        <Modal
          isOpen={isOpenModal}
          onClose={handleCloseModal}
          producto={productoAagregar}
        />
      ) : null}
      {cantidadProductos ? <VisorCarrito cantidad={cantidadProductos} /> : null}

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
      ) : (
        <div className="spin spin-Lista"></div>
      )}
    </>
  ) : (
    <Redirect to="/" />
  );
}

const VisorCarrito = ({ cantidad }) => {
  return (
    <div className="visor-carrito">
      <Link className="link-visor-carrito" to="/Carrito">
        <span>Tu Pedido</span>
        <span>{`${cantidad} item`}</span>
      </Link>
    </div>
  );
};

export default Lista;
