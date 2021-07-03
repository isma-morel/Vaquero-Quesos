import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import { Iconos } from "../Dashboard/Dashboard";
import "./Permisos.css";

const Permisos = ({ idPermiso }) => {
  const [listaPermisos, setListaPermisos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useHistory();
  const pedirListaPermisos = async () => {
    const { usuario, Token, permisos } = JSON.parse(
      localStorage.getItem("auth")
    );

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
  useEffect(() => {
    pedirListaPermisos();
  }, []);

  const handleCheck = (e) => {
    const { name, checked } = e.target;
  };

  return (
    <div className="permisos">
      {isLoading ? (
        <div className="spin"></div>
      ) : (
        <div className="permisos-container">
          <h2>Permisos</h2>
          <select name="" id="" className="usuario">
            <option value="e">e</option>
          </select>
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
        </div>
      )}
    </div>
  );
};

export default Permisos;
