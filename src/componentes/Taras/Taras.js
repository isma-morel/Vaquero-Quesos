import { useEffect, useState } from "react";
import { BASE_URL } from "../../BaseURL.json";
import { toast } from "react-toastify";
import { useHistory } from "react-router";
import useModal from "../../hooks/useModal";
import "./Taras.css";

const Filtrar = (value, taras) => {
  let resultado = taras;
  resultado = resultado.filter((tara) =>
    tara.Descripcion.toUpperCase().includes(value.toUpperCase())
  );
  return resultado;
};

const Taras = () => {
  const [taras, setTaras] = useState();
  const [taraSeleccionada, setTaraSeleccionada] = useState();
  const [tarasFiltradas, setTarasFiltradas] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, handleModal] = useModal();

  const { push } = useHistory();
  const pedirTaras = async () => {
    setIsLoading(true);
    const auth = JSON.parse(localStorage.getItem("auth")) || {};
    try {
      //pido los datos.
      const result = await fetch(
        `${BASE_URL}iElemTaraSP/ElementosTaraDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );
      //compruebo el estado de la petcion
      if (result.status !== 200) {
        if (result.status === 401) {
          push("/");
        }
        throw new Error("error de coneccion");
      }

      const json = await result.json();
      setTaras(json);
    } catch (err) {
      toast.error("se ha producido un error.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    pedirTaras();
  }, []);
  useEffect(() => {
    setTarasFiltradas(taras);
  }, [taras]);
  const handleCrear = (e) => {
    handleModal();
  };
  const handleEditar = (tara) => (e) => {
    alert("editar");
  };
  const handleEliminar = (tara) => (e) => {
    alert("eliminar");
  };

  const handleChangeFiltro = (e) => {
    const resultado = Filtrar(e.target.value, taras);
    if (!resultado) return;
    setTarasFiltradas(resultado);
  };
  return (
    <div className="taras">
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />
          <span className="titulo">Taras</span>
        </div>
        <hr />
      </div>
      {isLoading ? (
        <div className="spin"></div>
      ) : (
        <div className="contenedor-tabla">
          <ModalForm
            isOpen={isOpenModal}
            onClose={handleModal}
            Tara={taraSeleccionada}
          />
          <div className="contenedor-cliente">
            <button className="btn add" onClick={handleCrear}>
              Nueva
            </button>
          </div>
          <table className="tabla tabla-pedidos">
            <thead>
              <tr>
                <th>PESO</th>
                <th className="tara-descripcion-header">DESCRIPCION</th>
                <th>INACTIVO</th>
              </tr>
            </thead>
            <tbody>
              {tarasFiltradas?.map((tara, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "right" }}>{tara.Peso}</td>
                  <td className="tara-descripcion">
                    <span>{tara.Descripcion}</span>
                    <span>
                      <button onClick={handleEditar(tara)} className="btn edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={handleEliminar(tara)}
                        className="btn remove">
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {tara.Inactivo ? <i className="fa fa-check"></i> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ModalForm = ({ Tara, isOpen, onClose }) => {
  const [inputs, setInputs] = useState({
    peso: 0,
    descripcion: "",
    inactivo: false,
  });
  const handleChange = (e) => {
    const { target } = e;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const handleOverlay = (e) => {
    onClose();
  };
  return (
    <div className={`overlay ${isOpen ? "open" : ""}`} onClick={handleOverlay}>
      <div onClick={(e) => e.stopPropagation()} className="modal">
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step={0.1}
            className="usuario"
            placeholder="Peso"
            name="peso"
            value={inputs.peso}
            onChange={handleChange}
          />
          <input
            type="text"
            className="usuario"
            placeholder="Descripcion"
            name="descripcion"
            value={inputs.descripcion}
            onChange={handleChange}
          />
          <input
            type="checkbox"
            name="inactivo"
            checked={inputs.inactivo}
            onChange={handleChange}
          />
          <div className="botonera">
            <button className="btn cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn add">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Taras;
