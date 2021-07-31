import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import { Iconos } from "../Dashboard/Dashboard";
import "./Permisos.css";

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
  const { usuario, Token, permisos } = JSON.parse(
    localStorage.getItem("auth") || []
  );

  const pedirListaPermisos = async () => {
    if (!Token || !permisos.some(({ IdMenu }) => IdMenu === idPermiso))
      return push("/");
    const result = await fetch(
      `${BASE_URL}iMenusSP/MenusDatos?pUsuario=${usuario}&pToken=${Token}`
    );

    if (result.status !== 200) {
      toast.error("error al obtener los datos");
      return;
    }

    const json = await result.json();
    setListaPermisos([
      ...json
        .map((permiso) => ({ ...permiso, Seleccionado: false }))
        .sort((permisoA, permisoB) => permisoA.IdMenu > permisoB.IdMenu),
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
      setListaClientes(json.filter(({ TipoCliente }) => TipoCliente === "S"));
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
  const guardarPermisosDelCliente = async () => {
    /* iMenusSP/Guardar?pUsuario={pUsuario}&pToken={pToken}&pIdCliente={pIdCliente} */
    try {
      await fetch(
        `${BASE_URL}iMenusSP/Guardar?pUsuario=${usuario}&pToken=${Token}&pIdCliente=${clienteSeleccionado}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(listaPermisos),
        }
      );
      toast.success("Permisos guardados correctamente");
    } catch (err) {
      toast.error("se produjo un error al guardar los permisos");
      console.log(err);
    } finally {
      pedirPermisoDelCliente();
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
    setListaPermisos(
      listaTemp.sort((prodA, prodB) => prodA.IdMenu > prodB.IdMenu)
    );
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
  const handleSeleccionarTodos = () => {
    const permisosTemp = listaPermisos.map((permiso) => ({
      ...permiso,
      Seleccionado: true,
    }));
    setListaPermisos(permisosTemp);
  };
  const handleGuardar = (e) => {
    if (clienteSeleccionado == 0) return;
    setIsLoadingPermisosCliente(true);
    guardarPermisosDelCliente();
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
          <button className="btn btn-todos" onClick={handleSeleccionarTodos}>
            Seleccionar Todos
          </button>
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
            <button onClick={handleGuardar} className="btn btn-guardar">
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permisos;
