import React, { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router";
import { toast } from "react-toastify";
import { ModalCarrito } from "..";
import { BASE_URL } from "../../BaseURL.json";
import useModal from "../../hooks/useModal";
import "./Carrito.css";
const Carrito = () => {
  const history = useHistory();
  const [isOpenCarritoModal, handleCarritoModal] = useModal();
  const [isOpenConfirmacionModal, handleConfirmacionModal] = useModal();
  const [productoEditable, setProductoEditable] = useState(null);
  const [productos, setProductos] = useState([]);
  const [user, setUser] = useState();
  const confirmarUsuario = () =>
    JSON.parse(sessionStorage.getItem("auth"))?.TipoCliente === "C";
  useEffect(() => {
    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
    const usuario = JSON.parse(sessionStorage.getItem("auth"));
    !confirmarUsuario() && history.push("/");
    setUser(usuario);
    setProductos(carrito);
  }, []);
  const handleConfirmacion = (e) => {
    handleConfirmacionModal();
  };
  const handleConfirmar = async (e) => {
    handleConfirmacionModal();

    let pedido = {
      Numero: 0,
      IdCliente: user.IdCliente,
      IdClienteRegistro: user.vendedor
        ? user.vendedor.IdCliente
        : user.IdCliente,
      Observacion: "",
      Productos: [],
    };

    productos.map((producto) => {
      const { Medidas, cantidad, medida, IdProducto, IdMedidaPrinc } = producto;
      pedido.Productos = [
        ...pedido.Productos,
        {
          IdMedidaPrinc: IdMedidaPrinc,
          CantidadPrinc: cantidad,
          IdMedida: medida,
          Cantidad: cantidad,
          IdProducto: IdProducto,
          IdPedidosProducto: 0,
          IdPedido: 0,
        },
      ];
    });

    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/Guardar?pUsuario=${user.usuario}&pToken=${user.Token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedido),
        }
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          sessionStorage.removeItem("auth");
          history.push("/");
        }
        throw new Error("error al guardar el pedido");
      }
      toast.success(
        `pedido cargado con exito N° de pedido: ${await result.json()} `
      );
      sessionStorage.removeItem("carrito");
      setProductos([]);
    } catch (err) {
      toast.error(err.message);
    }
  };
  const handleCarrito = (index) => (e) => {
    setProductoEditable(index);
    handleCarritoModal();
  };
  const handleEliminar = (index) => (e) => {
    const tempProductos = [...productos];
    tempProductos.splice(index, 1);
    setProductos(tempProductos);
    sessionStorage.setItem("carrito", JSON.stringify(tempProductos));
  };
  return (
    <div className="contenedor-pedidos">
      <ModalCarrito
        isOpen={isOpenCarritoModal}
        onClose={handleCarritoModal}
        ProductoIndex={productoEditable}
        setProductos={setProductos}
      />
      <div className="modalConfirmar">
        <ModalConfirmar
          isOpen={isOpenConfirmacionModal}
          onClick={handleConfirmar}
          Close={handleConfirmacionModal}
        />
      </div>

      {productos.length > 0 ? (
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>CANTIDAD</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(
              ({ Descripcion, Medidas, cantidad, medida }, index) => (
                <tr key={index}>
                  <td>
                    <span>{Descripcion}</span>
                  </td>
                  <td className="contenedor-flex">
                    <span>{`${cantidad} ${
                      Medidas?.find(({ IdMedida }) => IdMedida === medida)
                        .DescripcionUM || ""
                    } `}</span>
                    <span className="botones">
                      <i
                        onClick={handleCarrito(index)}
                        className="fas fa-edit icono"></i>
                      <i
                        onClick={handleEliminar(index)}
                        className="fas fa-window-close icono-cancel"></i>
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : null}
      <div className="contenedor-botones">
        <button
          onClick={() => {
            history.push("/Lista");
          }}
          className="btn">
          Volver a la Lista
        </button>
        {productos.length ? (
          <button onClick={handleConfirmacion} className="btn btn-secondary">
            Confirmar
          </button>
        ) : null}
      </div>
    </div>
  );
};

const ModalConfirmar = ({ isOpen, onClick, Close }) => {
  return (
    <div className={`overlay ${isOpen && "open"}`}>
      <div className="card-productos">
        <h3>Esta a punto de confirmar el pedido, esta seguro?</h3>
        <div className="botones">
          <button onClick={Close}>Cancelar</button>
          <button onClick={onClick} className="btn-confirmar">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
