import React, { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router";
import "./Login.css";

const BASE_URL = "http://200.89.178.131/LacteosApi/api";

const Login = ({ logo, LogSucces }) => {
  const history = useHistory();
  const [error, setError] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();
    const { target } = e;

    fetch(
      `${BASE_URL}/iClientesSP/ValidarCliente?pUsuario=${target[0].value}&pContrasenia=${target[1].value}`
    )
      .then((result) => result.json())
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
        history.push("/Lista");
      })
      .catch((err) => setError(err.message));
  };

  return !localStorage.getItem("auth") ? (
    <div className="container">
      <img src={logo} alt="Logo Vaquero" />
      <hr />
      <form onSubmit={handleSubmit} className="container">
        <span className="error">{error}</span>
        <input required className="usuario" type="text" placeholder="Usuario" />
        <input
          required
          className="contraseña"
          type="password"
          placeholder="Contraseña"
        />
        <button className="button">ENVIAR</button>
        <small className="cuenta">
          Si no tiene una cuenta puede comunicarse a <br />
          <span>
            <a className="email" href="mailto:cuentasVaquero@gmail.com">
              ventas@quesosvaquero.com
            </a>
          </span>
        </small>
      </form>
    </div>
  ) : (
    <Redirect to="/Lista" />
  );
};
export default Login;
