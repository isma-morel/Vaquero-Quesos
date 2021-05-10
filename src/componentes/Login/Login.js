import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import "./Login.css";
import { BASE_URL } from "../../BaseURL.json";

const Login = ({ logo, LogSucces }) => {
  const history = useHistory();
  const [error, setError] = useState();
  const [isLoading, setLoading] = useState(false);
  const [isVendedor, setIsVendedor] = useState(false);
  const [clientes, setClientes] = useState([]);
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth) {
      switch (auth.TipoCliente) {
        case "C":
          history.push("/Lista");
          break;
        case "V":
          break;
        case "S":
          history.push("/Dashboard");
          break;
        default:
          break;
      }
    }
  }, []);
  const pedirListaClientes = async () => {};
  const handleSubmit = (e) => {
    e.preventDefault();
    const { target } = e;
    setLoading(true);
    fetch(
      `${BASE_URL}iClientesSP/ValidarCliente?pUsuario=${target[0].value}&pContrasenia=${target[1].value}`
    )
      .then((result) => {
        if (result.status !== 200) {
          throw new Error("usuario o contraseña incorrecta.");
        }
        return result.json();
      })
      .then((json) => {
        if (json.IdCliente === 0) {
          target[1].value = "";
          throw new Error("usuario o contraseña incorrecta.");
        }
        setError(null);
        localStorage.setItem(
          "auth",
          JSON.stringify({ ...json, usuario: target[0].value })
        );
        LogSucces();
        switch (json.TipoCliente) {
          case "C":
            history.push("/Lista");
            break;
          case "V":
            setIsVendedor(true);
            pedirListaClientes();
            break;
          case "S":
            history.push("/Dashboard");
            break;
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo Vaquero" />
      <hr />
      {isVendedor ? (
        <div class="container">
          <select name="Clientes"></select>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="container">
          <span className="error">{error}</span>
          <input
            required
            className="usuario"
            type="text"
            placeholder="Usuario"
          />
          <input
            required
            className="contraseña"
            type="password"
            placeholder="Contraseña"
          />
          <button disabled={isLoading} className="button">
            ENVIAR
          </button>
          <small className="cuenta">
            Si no tiene una cuenta puede comunicarse a <br />
            <span>
              <a className="email" href="mailto:ventas@quesosvaquero.com">
                ventas@quesosvaquero.com
              </a>
            </span>
          </small>
        </form>
      )}
    </div>
  );
};
export default Login;
