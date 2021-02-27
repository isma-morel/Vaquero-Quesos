import "./App.css";
import { Login, Carrito, Lista, Modal, ModalCarrito } from "./componentes";
import { logo } from "./logo.json";
import { granVaquero } from "./GranVaquero.json";
import useModal from "./hooks/useModal";
import { useState } from "react";
function App() {
  const [isOpenModal, handleModal] = useModal();
  const [isOpenCarritoModal, handleCarritoModal] = useModal();
  const [productoEditable, setProductoEditable] = useState({});
  const handleCarrito = (producto) => (e) => {
    setProductoEditable(producto);
    handleCarritoModal();
  };
  return (
    <div className="contenedor">
      {/*  <BasePage titulo="MAYORISTAS - 57| 22/01/2021">
        <Modal isOpen={isOpenModal} onClose={handleModal} />
        <Lista onRowClick={handleModal} />
      </BasePage> */}
      {/* <Login logo={logo} /> */}
      <BasePage titulo="CARRITO - CLIENTE N° 388221-4">
        <ModalCarrito
          isOpen={isOpenCarritoModal}
          onClose={handleCarritoModal}
          Producto={productoEditable}
        />
        <Carrito onEdit={handleCarrito} />
      </BasePage>
    </div>
  );
}

const BasePage = ({ children, titulo }) => {
  return (
    <>
      <div className="contenedor__landing">
        <img src={logo} alt="Logo Vaquero" />

        <div className="contenedor__titulo" style={{}}>
          <h2>{titulo}</h2>
          <hr />
        </div>
      </div>

      <div className="contenedor__lista">{children}</div>
    </>
  );
};

export default App;
