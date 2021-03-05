import "./App.css";
import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";
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
    <BrowserRouter>
      <div className="contenedor">
        <Switch>
          <Route exact path="/">
            <Login logo={logo} />
          </Route>

          {localStorage.getItem("auth") && (
            <>
              <Route exact path="/Lista">
                <BasePage titulo="MAYORISTAS - 57| 22/01/2021">
                  <Modal isOpen={isOpenModal} onClose={handleModal} />
                  <Lista onRowClick={handleModal} />
                </BasePage>
              </Route>
              <Route path="/Carrito">
                <BasePage titulo="CARRITO - CLIENTE N° 388221-4">
                  <ModalCarrito
                    isOpen={isOpenCarritoModal}
                    onClose={handleCarritoModal}
                    Producto={productoEditable}
                  />
                  <Carrito onEdit={handleCarrito} />
                </BasePage>
              </Route>
            </>
          )}
          <Redirect to="/" />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

const BasePage = ({ children, titulo }) => {
  return (
    <>
      <div className="botonesNav">
        <Link to="/Carrito">
          <i class="fas fa-shopping-cart"></i>
        </Link>
        <span>Cliente: 388221-4</span>
      </div>
      <div className="contenedor__landing">
        <img src={logo} alt="Logo Vaquero" />

        <div className="contenedor__titulo">
          <h2>{titulo}</h2>
          <hr />
        </div>
      </div>

      <div className="contenedor__lista">{children}</div>
    </>
  );
};

export default App;
