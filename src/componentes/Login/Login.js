import React, { useEffect } from "react";
import "./Login.css";

const BASE_URL = "https:localhost:5000/api";

const Login = ({ logo }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const { target } = e;

    fetch(
      `${BASE_URL}/ClientesSp/ValidarCliente?pUsuario=${target[0].value}&pContraseña=${target[1].value}`
    )
      .then((result) => result.json())
      .then(console.log)
      .catch(console.log);
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo Vaquero" />
      <hr />
      <form onSubmit={handleSubmit} className="container">
        <input className="usuario" type="text" placeholder="Usuario" />
        <input
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
  );
};
export default Login;
