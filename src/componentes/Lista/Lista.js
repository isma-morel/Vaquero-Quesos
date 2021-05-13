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
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    setCantidadProductos(carrito.length);
  };
  const handleCloseModal = (e) => {
    obtenerCarrito();
    handleModal();
  };

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (auth && auth.TipoCliente === "S") {
      history.push("/Dashboard");
      return;
    } else if (auth && auth.TipoCliente === "V") {
      history.push("/");
      return;
    }

    const pedirLista = async () => {
      if (!auth || !auth.IdCliente) localStorage.removeItem("auth");
      try {
        const json = await fetch(
          `${BASE_URL}iProductosSP/ProductosDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
        );
        if (json.status !== 200) {
          if (json.status === 401) {
            localStorage.removeItem("auth");
            history.push("/");
          }
          throw new Error("se ha producido un error");
        }
        const result = await json.json();
        setProductosState(result);
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
  return localStorage.getItem("auth") ? (
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
