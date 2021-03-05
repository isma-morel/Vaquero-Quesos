import React from "react";

import "./Login.css";
const Login = ({ logo }) => {
  return (
    <div className="container">
      <img src={logo} alt="Logo Vaquero" />
      <hr />
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="container">
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
            <a class="email" href="mailto:cuentasVaquero@gmail.com">
              ventas@quesosvaquero.com
            </a>
          </span>
        </small>
      </form>
    </div>
  );
};
export default Login;
