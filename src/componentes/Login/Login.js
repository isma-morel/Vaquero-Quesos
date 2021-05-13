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
          setIsVendedor(true);
          pedirListaClientes(auth);
          break;
        case "S":
          history.push("/Dashboard");
          break;
        default:
          break;
      }
    }
  }, []);
  const pedirListaClientes = async (auth) => {
    try {
      const result = await fetch(
        `${BASE_URL}iClientesSP/ClientesDelVendedor?pUsuario=${auth.usuario}&pToken=${auth.Token}&pVendedor=${auth.IdCliente}`
      );
      if (result.status !== 200) {
        throw new Error(result.message);
      }

      const json = await result.json();

      setClientes(
        json.Clientes.map((cliente) => ({
          ...cliente,
          usuario: cliente.Usuario,
          TipoCliente: "C",
          isVendedor: true,
          vendedor: auth,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };
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
        switch (json.TipoCliente) {
          case "C":
            history.push("/Lista");
            LogSucces();
            break;
          case "V":
            setIsVendedor(true);
            pedirListaClientes({ ...json, usuario: target[0].value });
            break;
          case "S":
            history.push("/Dashboard");
            LogSucces();
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
        <SelecionCliente clientes={clientes} LogSucces={LogSucces} />
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

const SelecionCliente = ({ clientes, LogSucces }) => {
  const history = useHistory();
  const [clienteSeleccionado, setClienteSeleccionado] = useState(0);

  const handleClick = (e) => {
    const Cliente = clientes[clienteSeleccionado];
    localStorage.removeItem("auth");
    localStorage.setItem("auth", JSON.stringify({ ...Cliente }));
    LogSucces();
    history.push("/Lista");
  };
  const handleChangeSelect = (e) => {
    const { value } = e.target;
    setClienteSeleccionado(value);
  };
  return (
    <div className="container">
      <select value={clienteSeleccionado} onChange={handleChangeSelect}>
        {clientes.map((cliente, i) => (
          <option value={i} key={i}>
            {cliente.Nombre}
          </option>
        ))}
      </select>
      <button className="button" onClick={handleClick}>
        Seleccionar
      </button>
    </div>
  );
};
export default Login;
