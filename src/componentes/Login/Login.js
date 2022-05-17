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
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    const tipo = {
      C: () => history.push("/Lista"),
      V: () => {
        setIsVendedor(true);
        pedirListaClientes(auth);
      },
      S: () => history.push("/Dashboard"),
    };
    if (auth) tipo[auth.TipoCliente]();
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
    const tipo = {
      S: () => {
        LogSucces();
        history.push("/Dashboard");
      },
      C: () => {
        LogSucces();
        history.push("/Lista");
      },
      V: (json, target) => {
        setIsVendedor(true);
        pedirListaClientes({ ...json, usuario: target[0].value });
      },
    };
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
        if (json.IdCliente === 0 || json.Inactivo) {
          target[1].value = "";
          throw new Error("usuario o contraseña incorrecta.");
        }
        setError(null);
        sessionStorage.setItem(
          "auth",
          JSON.stringify({ ...json, usuario: target[0].value })
        );

        tipo[json.TipoCliente](json, target);
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
  const [clientesFiltrados, setClientesFiltrados] = useState(clientes);
  console.log(clientes);
  const handleClick = (e) => {
    const Cliente = clientesFiltrados[clienteSeleccionado];
    sessionStorage.removeItem("auth");
    sessionStorage.setItem("auth", JSON.stringify({ ...Cliente }));
    LogSucces();
    history.push("/Lista");
  };
  const filtrarPedidoPorCliente = (value, clientes) => {
    return clientes.filter((cliente) =>
      cliente.Nombre.toLowerCase().includes(value.toLowerCase())
    );
  };
  const filtrar = (value, pedidos) => {
    return filtrarPedidoPorCliente(value, pedidos);
  };
  const handleChangeFiltro = (e) => {
    const resultado = filtrar(e.target.value, clientes);
    if (!resultado) return;
    setClientesFiltrados(resultado);
  };
  const handleChangeSelect = (e) => {
    const { value } = e.target;
    setClienteSeleccionado(value);
  };
  useEffect(() => {
    setClientesFiltrados(clientes);
  }, [clientes]);
  return (
    <>
      {console.log(clientesFiltrados)}
      <div className="container">
        <input
          type="text"
          className="inputLogin"
          placeholder="Filtro"
          onChange={handleChangeFiltro}
        />
        <small>Seleccione un usuario para continuar.</small>
        <select
          className="usuario"
          value={clienteSeleccionado}
          onChange={handleChangeSelect}
        >
          {clientesFiltrados.map((cliente, i) => (
            <option value={i} key={i}>
              {cliente.Nombre}
            </option>
          ))}
        </select>
        <button className="button" onClick={handleClick}>
          Seleccionar
        </button>
      </div>
    </>
  );
};
export default Login;
