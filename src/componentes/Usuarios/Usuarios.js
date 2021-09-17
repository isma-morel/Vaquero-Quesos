import { useEffect, useState } from "react";
import { BASE_URL } from "../../BaseURL.json";
import { toast } from "react-toastify";
import { useHistory } from "react-router";
import useModal from "../../hooks/useModal";

import "./Usuarios.css";

const Usuarios = ({ idPermiso }) => {
  const tipoDeClientes = {
    S: "SUPERVISOR",
    V: "VENDEDOR",
    C: "CLIENTE",
  };

  const [users, setUsers] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useHistory();
  const [isOpenModal, handleCloseModal] = useModal();

  const obtenerUsuarios = async () => {
    setIsLoading(true);
    try {
      const auth = JSON.parse(localStorage.getItem("auth")) || {};

      if (!auth || !auth.permisos.some(({ IdMenu }) => IdMenu === idPermiso))
        return push("/");

      const result = await fetch(
        `${BASE_URL}iClientesSP/ClientesDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );

      if (result.status !== 200) {
        toast.error("se produjo un error al obtener los usuarios");
        console.log(result.statusText);
        return push("/");
      }

      const usuarios = await result.json();
      console.log(usuarios);
      setUsers(usuarios);
    } catch (err) {
      toast.error("se produjo un error al obtener los usuarios");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleAddClick = () => {
    setUsuarioSeleccionado({});
    handleCloseModal(true);
  };
  const handleDeleteClick = (index) => async (e) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth")) || {};

      if (!auth || !auth.permisos.some(({ IdMenu }) => IdMenu === idPermiso))
        return push("/");
      const usuarioAeliminar = users[index];

      const result = await fetch(
        `${BASE_URL}iClientesSP/Borrar?pUsuario=${auth.usuario}&pToken=${auth.Token}&pUsuarioClie=${usuarioAeliminar.IdCliente}`,
        {
          method: "POST",
        }
      );

      if (result !== 200) {
        if (result.status !== 200) {
          toast.error("se produjo un error al eliminar el usuario");
          console.log(result.statusText);
          return push("/");
        }
      }

      setUsers([
        ...users.filter((user) => user.Usuario !== usuarioAeliminar.Usuario),
      ]);
    } catch (err) {
      toast.error("se produjo un error al eliminar el usuario");
      console.log(err);
    }
  };
  const handleEditClick = (index) => (e) => {
    setUsuarioSeleccionado(users[index]);
    handleCloseModal(true);
  };
  const handleClose = () => {
    obtenerUsuarios();
    handleCloseModal();
  };
  return (
    <div className="carga-productos">
      {isLoading ? (
        <div className="spin"></div>
      ) : (
        <div className="contenedor-tabla">
          <ModalUsuarios
            Usuario={usuarioSeleccionado}
            onClose={handleClose}
            isOpen={isOpenModal}
          />
          <div className="contenedor-cliente">
            <button onClick={handleAddClick} className="btn add">
              Nuevo
            </button>
          </div>
          <table className="tabla tabla-pedidos">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>NOMBRE</th>
                <th>CONTRASEÑA</th>
                <th>TIPO</th>
              </tr>
            </thead>

            <tbody>
              {users.map(
                ({ Usuario, Nombre, Contrasenia, TipoCliente }, index) => (
                  <tr key={index}>
                    <td>{Usuario}</td>
                    <td className="descripcion">
                      <div>
                        <span>{Nombre}</span>
                      </div>
                      <div>
                        <button onClick={handleEditClick(index)}>
                          <i
                            title="presione para editar"
                            className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={handleDeleteClick(index)}
                          style={{ color: "red" }}>
                          <i
                            title="presione para borrar"
                            className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                    <td>{Contrasenia}</td>
                    <td>{tipoDeClientes[TipoCliente]}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ModalUsuarios = ({ Usuario, onClose, isOpen }) => {
  const usuarioInicial = {
    Nombre: "",
    TipoCliente: "C",
    CodigoSistExt: "",
    Inactivo: false,
    CondicionPago: "",
    ListaPrecio: "",
  };
  const [inputs, setInputs] = useState(usuarioInicial);

  useEffect(() => {
    if (!Usuario?.Nombre) return setInputs(usuarioInicial);
    setInputs({ ...Usuario });
  }, [Usuario]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setInputs({ ...inputs, [name]: type === "checkbox" ? checked : value });
  };

  const handleGuardar = async () => {
    try {
      const {
        Nombre,
        TipoCliente,
        CodigoSistExt,
        Inactivo,
        CondicionPago,
        ListaPrecio,
      } = inputs;
      const auth = JSON.parse(localStorage.getItem("auth")) || {};
      const result = await fetch(
        `${BASE_URL}iClientesSP/Guardar?pUsuario=${auth.usuario}&pToken=${
          auth.Token
        }&pNombre=${Nombre}&pTipoCliente=${TipoCliente}&pCodigoSistExt=${
          CodigoSistExt ? CodigoSistExt : Nombre
        }&pInactivo=${Inactivo}&pListaPrecio=${"."}&pCondicionPago=${"."}`,
        { method: "POST" }
      );

      if (result.status !== 200) {
        console.log(result.statusText);
        toast.error("se produjo un error al guardar el usuario");
        return;
      }

      toast.success("Usuario creado con exito");
    } catch (err) {
      console.log(err);
      toast.error("se produjo un error al guardar el usuario");
    } finally {
      onClose();
    }
  };
  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="modal">
        <div className="modal-body">
          <div className="Inputs">
            <div
              className="contenedor-input"
              style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="">Nombre</label>
              <input
                onChange={handleInputChange}
                name="Nombre"
                value={inputs.Nombre}
                type="text"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="">Tipo de Cliente</label>
              <select
                onChange={handleInputChange}
                value={inputs.TipoCliente}
                name="TipoCliente"
                id="">
                <option value="C">Cliente</option>
                <option value="V">Vendedor</option>
                <option value="S">Supervisor</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <label
                htmlFor="inactivo"
                className={`inactivo ${inputs.Inactivo ? "true" : "false"}`}>
                Inactivo {inputs.Inactivo ? "si" : "no"}
              </label>
              <input
                onChange={handleInputChange}
                checked={inputs.Inactivo}
                style={{ display: "none" }}
                type="checkbox"
                name="Inactivo"
                id="inactivo"
              />
            </div>
            <div
              className="contenedor-input"
              style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="">Codigo Sist. Ext.</label>
              <input
                onChange={handleInputChange}
                name="CodigoSistExt"
                value={inputs.CodigoSistExt}
                type="text"
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1em",
            }}
            className="modal-botonera">
            <button className="cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button className="aceptar" onClick={handleGuardar}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
