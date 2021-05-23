import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
} from "react-router-dom";
import { Login, Carrito, Lista, Dashboard } from "./componentes";
import { logo } from "./logo.json";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

function App() {
  const [usuario, setUsuario] = useState();

  useEffect(() => {
    LogSucces();
  }, []);
  const LogSucces = () => {
    const user = JSON.parse(localStorage.getItem("auth"));
    setUsuario(user);
  };

  return (
    <BrowserRouter>
      <div className="contenedor">
        <Switch>
          <Route exact path="/Lista">
            <BasePage
              LogSucces={LogSucces}
              usuario={usuario}
              titulo="MAYORISTAS - 57| 22/01/2021">
              <Lista />
            </BasePage>
          </Route>

          <Route exact path="/Carrito">
            <BasePage
              LogSucces={LogSucces}
              usuario={usuario}
              titulo={`CARRITO - ${usuario?.Nombre} `}>
              <Carrito />
            </BasePage>
          </Route>

          <Route path="/Dashboard">
            <Dashboard usuario={usuario} />
          </Route>
          <Route exact path="/Logout">
            <Logout />
          </Route>
          <Route exact path="/">
            <Login LogSucces={LogSucces} logo={logo} />
          </Route>
          <Redirect to="/" />
        </Switch>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

const BasePage = ({ children, titulo, usuario = {}, LogSucces }) => {
  const handleSwitch = (e) => {
    localStorage.setItem("auth", JSON.stringify({ ...usuario.vendedor }));
  };
  useEffect(() => {
    if (!usuario.Token) {
      LogSucces();
    }
  }, []);
  return (
    <>
      <div className="botonesNav">
        <span>Cliente: {usuario?.Nombre}</span>
        <Link to="/Logout">
          <i className="fas fa-sign-out-alt"></i>
        </Link>
        {usuario.isVendedor && (
          <Link to="/" onClick={handleSwitch}>
            <i className="fas fa-random"></i>
          </Link>
        )}
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

const Logout = () => {
  const history = useHistory();
  useEffect(() => {
    localStorage.removeItem("auth");
    history.push("/");
  }, []);
  return "";
};

export default App;
