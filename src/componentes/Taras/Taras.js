import { useEffect, useState } from "react";
import { BASE_URL } from "../../BaseURL.json";
import { toast } from "react-toastify";
import { useHistory } from "react-router";
import useModal from "../../hooks/useModal";
import { BsCaretDown, BsCaretUp } from "react-icons/bs";
import "./Taras.css";

/* Filtros */
const filtrarTarasPorPeso = (peso, taras) => {
  return taras.filter((tara) => tara.Peso.toString().includes(peso));
};

const filtrarTarasPorNombre = (nombre, taras) => {
  return taras.filter((tara) =>
    tara.Descripcion.toLowerCase().includes(nombre.toLowerCase())
  );
};

const filtrar = (value, usuarios) => {
  const esNumero = /^[0-9]+$/;
  let resultado = usuarios;
  if (value.match(esNumero)) {
    resultado = filtrarTarasPorPeso(value, usuarios);
  } else {
    resultado = filtrarTarasPorNombre(value, usuarios);
  }
  return resultado;
};

const Taras = () => {
  const [taras, setTaras] = useState();
  const [taraSeleccionada, setTaraSeleccionada] = useState();
  const [isClickNombre, setIsClickNombre] = useState(false);
  const [isClickPeso, setIsClickPeso] = useState(false);
  const [tarasFiltradas, setTarasFiltradas] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, handleModal] = useModal();

  const { push } = useHistory();
  const pedirTaras = async () => {
    setIsLoading(true);
    const auth = JSON.parse(sessionStorage.getItem("auth")) || {};
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
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    if (!auth) {
      push("/");
      return;
    }
    pedirTaras();
  }, []);
  useEffect(() => {
    setTarasFiltradas(taras);
  }, [taras]);
  const handleCrear = (e) => {
    setTaraSeleccionada(null);
    handleModal();
  };
  const handleEditar = (tara) => (e) => {
    setTaraSeleccionada(tara);
    handleModal();
  };
  const handleEliminar = (tara) => async (e) => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    if (!auth) {
      push("/");
      return;
    }
    try {
      const result = await fetch(
        `${BASE_URL}iElemTaraSP/Borrar?pUsuario=${auth.usuario}&pToken=${auth.Token}&pIdElemTara=${tara.IdElemTara}`,
        {
          method: "POST",
        }
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          push("/");
        }
        throw new Error(result.message);
      }

      toast.success("Tara eliminada correctamente");
      pedirTaras();
    } catch (err) {
      toast.error("se ha producido un error");
      console.log(err);
    }
  };

  const handleChangeFiltro = ({ target: { value } }) => {
    const resultado = filtrar(value, taras);
    if (!resultado) return;
    setTarasFiltradas(resultado);
  };

  const handleClickNombre = () => {
    setIsClickNombre(!isClickNombre);
    if (isClickNombre) {
      const listSort = tarasFiltradas;
      listSort.sort((a, b) => {
        if (a.Descripcion > b.Descripcion) return -1;
        if (a.Descripcion < b.Descripcion) return 1;
        return 0;
      });
      setTarasFiltradas(listSort);
    } else {
      const listSort = tarasFiltradas;
      listSort.sort((a, b) => {
        if (a.Descripcion < b.Descripcion) return -1;
        if (a.Descripcion > b.Descripcion) return 1;
        return 0;
      });
      setTarasFiltradas(listSort);
    }
  };

  const handleClickPeso = () => {
    setIsClickPeso(!isClickPeso);
    if (isClickPeso) {
      const listSort = tarasFiltradas;
      listSort.sort((a, b) => {
        if (a.Peso > b.Peso) return -1;
        if (a.Peso < b.Peso) return 1;
        return 0;
      });
      setTarasFiltradas(listSort);
    } else {
      const listSort = tarasFiltradas;
      listSort.sort((a, b) => {
        if (a.Peso < b.Peso) return -1;
        if (a.Peso > b.Peso) return 1;
        return 0;
      });
      setTarasFiltradas(listSort);
    }
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
            key={isOpenModal}
            isOpen={isOpenModal}
            onClose={handleModal}
            Tara={taraSeleccionada}
            pedirTaras={pedirTaras}
          />
          <div className="contenedor-cliente">
            <button className="btn add" onClick={handleCrear}>
              Nueva
            </button>
          </div>
          <table className="tabla tabla-pedidos">
            <thead>
              <tr>
                <th onClick={handleClickPeso} style={{ cursor: "pointer" }}>
                  PESO {isClickPeso ? <BsCaretDown /> : <BsCaretUp />}
                </th>
                <th
                  onClick={handleClickNombre}
                  style={{ cursor: "pointer" }}
                  className=""
                >
                  DESCRIPCION {isClickNombre ? <BsCaretDown /> : <BsCaretUp />}
                </th>
                <th>INACTIVO</th>
                <th>PESO VARIABLE</th>
              </tr>
            </thead>
            <tbody>
              {tarasFiltradas?.map((tara, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "right" }}>
                    {parseFloat(tara.Peso).toFixed(2)}
                  </td>
                  <td className="tara-descripcion">
                    <span>{tara.Descripcion}</span>
                    <span>
                      <button onClick={handleEditar(tara)} className="btn edit">
                        <i
                          title="presione para editar"
                          className="fas fa-edit"
                        ></i>
                      </button>
                      <button
                        onClick={handleEliminar(tara)}
                        className="btn remove"
                      >
                        <i
                          title="Presione para eliminar"
                          className="fas fa-times"
                        ></i>
                      </button>
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {tara.Inactivo ? <i className="fa fa-check"></i> : null}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {tara.EditaPeso ? <i className="fa fa-check"></i> : null}
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

const ModalForm = ({ Tara, isOpen, onClose, pedirTaras }) => {
  const { push } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState({
    peso: 0,
    descripcion: "",
    inactivo: false,
    editaPeso: false,
  });
  const guardarTara = async () => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    if (!auth) {
      push("/");
      return;
    }

    try {
      setIsLoading(true);
      const result = await fetch(
        `${BASE_URL}iElemTaraSP/Guardar?pUsuario=${auth.usuario}&pToken=${
          auth.Token
        }&pIdElemTara=${Tara ? Tara.IdElemTara : 0}&pDescripcion=${
          inputs.descripcion
        }&pPeso=${parseFloat(inputs.peso).toFixed(2)}&pEditaPeso=${
          inputs.editaPeso
        }&pInactivo=${inputs.inactivo}`,
        {
          method: "POST",
        }
      );

      if (result.status !== 200) {
        if (result.status === 401) {
          toast.error("error");
          push("/");
        }
        throw new Error(result.message);
      }

      toast.success("Tara cargada correctamente");
      pedirTaras();
      onClose();
    } catch (err) {
      toast.error("ocurrio un error.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!Tara) {
      return;
    }
    setInputs({
      peso: Tara.Peso,
      descripcion: Tara.Descripcion,
      inactivo: Tara.Inactivo,
      editaPeso: Tara.EditaPeso,
    });
  }, []);
  const handleChange = (e) => {
    const { target } = e;
    let inputsTemp = inputs;
    if (target.name === "editaPeso" && target.checked) {
      inputsTemp.peso = 0;
    }
    setInputs({
      ...inputsTemp,
      [target.name]:
        target.type === "checkbox"
          ? target.checked
          : target.name === "peso"
          ? target.value
          : target.value.toUpperCase(),
    });
  };
  const handleSubmit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("esaca");
    guardarTara();
  };
  const handleOverlay = (e) => {
    onClose();
  };
  return (
    <div className={`overlay ${isOpen ? "open" : ""}`} onClick={handleOverlay}>
      <div onClick={(e) => e.stopPropagation()} className="modal">
        <form onSubmit={handleSubmit}>
          <div className="contenedor-inputs">
            <label>Peso</label>
            <input
              disabled={inputs.editaPeso}
              type="text"
              className="usuario"
              placeholder="Peso"
              name="peso"
              value={
                isNaN(inputs.peso) ? "0.00" : parseFloat(inputs.peso).toFixed(2)
              }
              onChange={handleChange}
            />
          </div>
          <div className="contenedor-inputs">
            <label>Descripcion</label>
            <input
              type="text"
              className="usuario"
              placeholder="Descripcion"
              name="descripcion"
              value={inputs.descripcion}
              onChange={handleChange}
            />
          </div>
          <label
            htmlFor="inactivo"
            className={`inactivo ${
              inputs.inactivo ? "btn cancelar" : "btn add"
            }`}
          >
            Inactivo {inputs.inactivo ? "si" : "no"}
          </label>
          <input
            id="inactivo"
            type="checkbox"
            name="inactivo"
            checked={inputs.inactivo}
            onChange={handleChange}
            hidden
          />
          <label
            htmlFor="editaPeso"
            className={`inactivo ${
              !inputs.editaPeso ? "btn cancelar" : "btn add"
            }`}
          >
            Edita Peso {inputs.editaPeso ? "si" : "no"}
          </label>
          <input
            id="editaPeso"
            type="checkbox"
            name="editaPeso"
            checked={inputs.editaPeso}
            onChange={handleChange}
            hidden
          />
          <div className="botonera">
            <button
              disabled={isLoading}
              className="btn cancelar"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button disabled={isLoading} className="btn add">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Taras;
