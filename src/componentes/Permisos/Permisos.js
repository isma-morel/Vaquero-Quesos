import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import { Iconos } from "../Dashboard/Dashboard";
import "./Permisos.css";
const { usuario, Token, permisos } = JSON.parse(localStorage.getItem("auth"));

const Permisos = ({ idPermiso }) => {
  const [listaPermisos, setListaPermisos] = useState([]);
  const [listaClientes, setListaClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(0);
  const [permisosClienteSeleccionado, setPermisosClienteSeleccionado] =
    useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPermisosCliente, setIsLoadingPermisosCliente] =
    useState(false);
  const { push } = useHistory();
  const pedirListaPermisos = async () => {
    if (!Token || !permisos.some(({ IdMenu }) => IdMenu === idPermiso))
      return push("/");
    const result = await fetch(
      `${BASE_URL}iMenusSP/MenusDatos?pUsuario=${usuario}&pToken=${Token}`
    );

    if (result.status !== 200) {
      throw new Error("error al obtener los datos");
    }

    const json = await result.json();
    setListaPermisos([
      ...json.map((permiso) => ({ ...permiso, Seleccionado: false })),
    ]);
    try {
    } catch (err) {
      toast.error("ocurrio un error");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  const pedirListaClientes = async () => {
    if (!Token || !permisos.some(({ IdMenu }) => IdMenu === idPermiso)) {
      push("/");
      return;
    }

    try {
      const result = await fetch(
        `${BASE_URL}iClientesSP/ClientesDatos?pUsuario=${usuario}&pToken=${Token}`
      );
      const json = await result.json();
      setListaClientes(json.filter(({ TipoCliente }) => TipoCliente !== "C"));
    } catch (err) {
      toast.error("ocurrio un error al obtener los Usuarios.");
      console.log(err);
    }
  };
  const pedirPermisoDelCliente = async () => {
    try {
      if (clienteSeleccionado === 0) return;
      const result = await fetch(
        `${BASE_URL}iMenusSP/Permisos?pUsuario=${usuario}&pToken=${Token}&pIdCliente=${clienteSeleccionado}`
      );
      const json = await result.json();
      setPermisosClienteSeleccionado(json);
    } catch (err) {
      toast.error("ocurrio un error al obtener los permisos del Usuario");
      console.log(err);
    } finally {
      setIsLoadingPermisosCliente(false);
    }
  };
  useEffect(() => {
    pedirListaPermisos();
    pedirListaClientes();
  }, []);
  useEffect(() => {
    setIsLoadingPermisosCliente(true);
    pedirPermisoDelCliente();
  }, [clienteSeleccionado]);
  useEffect(() => {
    const listaTemp = listaPermisos.map((permiso) =>
      permisosClienteSeleccionado.some(
        (permisoC) => permisoC.IdMenu === permiso.IdMenu
      )
        ? { ...permiso, Seleccionado: true }
        : { ...permiso, Seleccionado: false }
    );
    setListaPermisos(listaTemp);
  }, [permisosClienteSeleccionado]);
  const handleCheck = (e) => {
    const { name, checked } = e.target;
    const permisosNuevo = listaPermisos.map((permiso) =>
      permiso.Titulo === name ? { ...permiso, Seleccionado: checked } : permiso
    );
    setListaPermisos(permisosNuevo);
  };
  const handleSelect = (e) => {
    const { value } = e.target;
    setClienteSeleccionado(value);
  };
  return (
    <div className="permisos">
      {isLoading ? (
        <div className="spin"></div>
      ) : (
        <div className="permisos-container">
          <h2>Permisos</h2>
          <select
            value={clienteSeleccionado}
            onChange={handleSelect}
            name="selectClientes"
            className="usuario">
            <option value={0}>Seleccione un Cliente...</option>
            {listaClientes.map((cliente) => (
              <option key={cliente.IdCliente} value={cliente.IdCliente}>
                {cliente.Nombre}
              </option>
            ))}
          </select>
          {isLoadingPermisosCliente ? (
            <div className="container">
              <div style={{ marginTop: "0px" }} className="spin"></div>
            </div>
          ) : (
            <div className="permisos-container-checks">
              {listaPermisos.map((permiso) => (
                <div key={permiso.IdMenu}>
                  <label
                    title={permiso.Titulo}
                    className={`permiso-check ${
                      permiso.Seleccionado ? "seleccionado" : ""
                    }`}
                    htmlFor={permiso.Titulo}>
                    {Iconos[permiso.Titulo]}
                  </label>
                  <input
                    onChange={handleCheck}
                    style={{ display: "none" }}
                    type="checkbox"
                    name={permiso.Titulo}
                    id={permiso.Titulo}
                    checked={permiso.Seleccionado}
                  />
                </div>
              ))}
            </div>
          )}
          <div>
            <button className="btn btn-guardar">Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permisos;
