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
  return (
    <div className="carga-productos">
      {isLoading ? (
        <div className="spin"></div>
      ) : (
        <div className="contenedor-tabla">
          <ModalUsuarios
            Usuario={usuarioSeleccionado}
            onClose={handleCloseModal}
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
  const [inputs, setInputs] = useState({
    Nombre: "",
    TipoCliente: "C",
    CodigoSisExt: "",
    Inactivo: false,
  });

  const handleGuardar = () => {};
  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-botonera">
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
