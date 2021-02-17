import React from "react";

import "./Login.css";
const Login = () => {
  return (
    <div className="container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="container"
      >
        <input className="usuario" type="text" placeholder="Usuario" />
        <input
          className="contraseña"
          type="password"
          placeholder="Contraseña"
        />
        <button className="button">ENVIAR</button>
        <small className="cuenta">
          Si no tiene una cuenta puede comunicarse a <br />
          <span>cuentasVaquero@gmail.com.</span>
        </small>
      </form>
    </div>
  );
};
export default Login;
