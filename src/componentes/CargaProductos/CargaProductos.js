import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./CargaProductos.css";
import "./AddOrEdit.css";
import useModal from "../../hooks/useModal";
const CargaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOrAdd, setIsEditOrAdd] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState();

  const { push } = useHistory();
  const obtenerPedidos = async () => {
    setIsLoading(true);
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      if (!auth) return push("/");

      const result = await fetch(
        `${BASE_URL}iProductosSP/ProductosDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );

      if (result.status !== 200) {
        if (result.status === 401) return push("/");
        throw new Error("error al obtener los pedidos");
      }

      const json = await result.json();
      setProductos(() => json);
    } catch (err) {
      console.log(err);
      toast.error(err);
    } finally {
      setIsLoading(() => false);
    }
  };
  useEffect(() => {
    return obtenerPedidos();
  }, []);

  const handleRowClick = (index) => (e) => {
    setProductoSeleccionado({
      ...productos[index],
      medidaPrincipal: productos[index].Medidas[0].IdMedida,
    });
    setIsEditOrAdd(true);
  };
  const handleAddClick = (e) => {
    setIsEditOrAdd(true);
  };
  const onCloseAddOrEdit = (e) => {
    setIsEditOrAdd(false);
    setProductoSeleccionado(null);
  };

  return (
    <div className="carga-productos">
      {isLoading ? (
        <div className="spin"></div>
      ) : isEditOrAdd ? (
        <AddOrEdit
          productoSeleccionado={productoSeleccionado}
          onClose={onCloseAddOrEdit}
          setProductoSeleccionado={setProductoSeleccionado}
        />
      ) : (
        <div className="contenedor-tabla">
          <div className="contenedor-cliente">
            <button onClick={handleAddClick} className="btn add">
              Nueva
            </button>
          </div>
          <table className="tabla tabla-pedidos">
            <thead>
              <tr>
                <th>CODIGO</th>
                <th>DESCRIPCION</th>
                <th>PRESENTACION</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(({ Codigo, Descripcion, Presentacion }, index) => (
                <tr
                  key={index}
                  title="Presione el click para editar"
                  onClick={handleRowClick(index)}>
                  <td>{Codigo}</td>
                  <td>{Descripcion}</td>
                  <td>{Presentacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AddOrEdit = ({
  productoSeleccionado,
  setProductoSeleccionado,
  onClose,
}) => {
  const referencedElement = useRef();
  const [imagen, setImagen] = useState();
  const [medidas, setMedidas] = useState([]);
  const [inputs, setInputs] = useState({
    ...productoSeleccionado,
  });
  const [isOpenModal, handleModal] = useModal();
  const { push } = useHistory();

  const pedirMedidas = async () => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth) return push("/");

    try {
      const resultado = await fetch(
        `${BASE_URL}iMedidasSP/MedidasDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );

      if (resultado.status !== 200) {
        if (resultado.status === 401) return push("/");
        throw new Error(resultado.text());
      }
      const json = await resultado.json();
      if (productoSeleccionado) {
        json.forEach((medida) => {
          medida.incluida = productoSeleccionado.Medidas.some(
            (prodMed) => prodMed.IdMedida === medida.IdMedida
          );
        });
      }
      setMedidas(json);
    } catch (err) {
      toast.error("ocurrio un error.");
      console.log(err);
    }
  };
  const pedirFoto = async () => {
    try {
      const reader = new FileReader();
      const result = await fetch(
        `${BASE_URL}iProductosSP/Foto?idProducto=${productoSeleccionado.IdProducto}`
      );
      const json = await result.json();
      const aver = await fetch(`data:image/png;base64,${json.Foto}`);
      const blob = await aver.blob();
      setImagen(blob);
    } catch (err) {
      toast.error("ocurrio un error.");
      console.log(err);
    }
  };

  useEffect(() => {
    pedirMedidas();

    if (productoSeleccionado?.TieneFoto) {
      pedirFoto();
    }
  }, []);

  const onFileChange = (e) => {
    setImagen(e.target.files[0]);
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setInputs({ ...inputs, [name]: type === "checkbox" ? checked : value });
  };
  const handleSabeModal = (medidaSeleccionada) => (e) => {
    if (
      productoSeleccionado?.Medidas?.some((medida) => {
        return medida.DescripcionUM === medidas[medidaSeleccionada].Descripcion;
      })
    )
      return;

    const Medidas = productoSeleccionado?.Medidas;

    Medidas.push({
      ...medidas[medidaSeleccionada],
      DescripcionUM: medidas[medidaSeleccionada].Descripcion,
    });
    handleModal();
    setProductoSeleccionado({ ...productoSeleccionado, Medidas });
  };
  const handleRemove = (index) => (e) => {
    const Medidas = productoSeleccionado.Medidas;
    Medidas.splice(index, 1);

    setProductoSeleccionado({ ...productoSeleccionado, Medidas });
  };

  return (
    <div className="AddOrEdit">
      <ModalMedidas
        medidas={medidas}
        isOpen={isOpenModal}
        onClose={handleModal}
        onSabe={handleSabeModal}
      />
      <div className="contenedor">
        <div className="contenedor-imagen">
          <img
            className="imagen"
            src={imagen ? URL.createObjectURL(imagen) : ""}
            alt="Imagen ilustrativa"
          />
          <input
            type="file"
            name="file"
            id="file"
            accept="image/*"
            onChange={onFileChange}
            ref={referencedElement}
          />
          <button
            onClick={(e) => {
              referencedElement.current.click();
            }}>
            <i className="fas fa-upload"></i>
            <span> Subir</span>
          </button>
        </div>
        <div className="contenedor-inputs">
          <div>
            <span>Codigo</span>
            <input
              type="text"
              name="Codigo"
              onChange={handleInputChange}
              value={inputs["Codigo"]}
            />
          </div>
          <div>
            <span>Descripcion</span>
            <input
              type="text"
              name="Descripcion"
              onChange={handleInputChange}
              value={inputs["Descripcion"]}
            />
          </div>
          <div>
            <span>Presentacion</span>
            <input
              type="text"
              name="Presentacion"
              onChange={handleInputChange}
              value={inputs["Presentacion"]}
            />
          </div>
          <div>
            <span>Medida Principal</span>
            <select
              name="medidaPrincipal"
              id="medidaPrincipal"
              onChange={handleInputChange}
              value={inputs["medidaPrincipal"]}>
              {productoSeleccionado?.Medidas?.map((medida) => (
                <option value={medida.IdMedida}>{medida.DescripcionUM}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="contenedor-inputs">
          <div>
            <span>Peso Promedio</span>
            <input
              type="number"
              min={0}
              step={0.1}
              name="PesoPromedio"
              onChange={handleInputChange}
              value={inputs["PesoPromedio"]}
            />
          </div>
          <div>
            <span>Porcentaje de Desvio</span>
            <input
              type="number"
              min={0}
              step={0.1}
              name="PorcDesvio"
              onChange={handleInputChange}
              value={inputs["PorcDesvio"]}
            />
          </div>
          <div>
            <label
              className={`Inactivo  ${inputs["Inactivo"] ? "true" : "false"}`}
              htmlFor="Inactivo">
              {`Inactivo ${inputs["Inactivo"] ? "Si" : "No"}`}
            </label>
            <input
              hidden
              type="checkbox"
              name="Inactivo"
              id="Inactivo"
              onChange={handleInputChange}
              checked={inputs["Inactivo"]}
            />
          </div>
        </div>
        <div className="contenedor-medidas contenedor-inputs">
          <span>Medidas</span>
          {productoSeleccionado?.Medidas.map((medida, index) => (
            <div>
              <span>
                {medida.DescripcionUM}
                <i
                  onClick={handleRemove(index)}
                  style={{ marginLeft: "1em", cursor: "pointer" }}
                  className="fas fa-times"></i>
              </span>
              <input type="number" />
            </div>
          ))}
          <button onClick={handleModal}>
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <div className="botonera">
        <button className="boton cancelar" onClick={onClose}>
          Cancelar
        </button>
        {productoSeleccionado ? (
          <button className="boton cancelar">Eliminar</button>
        ) : null}
        <button className="boton">Guardar</button>
      </div>
    </div>
  );
};
const ModalMedidas = ({ onSabe, onClose, isOpen, medidas }) => {
  const [medidaSeleccionada, setMedidaSeleccionada] = useState(0);

  const handleChange = (e) => {
    const { target } = e;
    setMedidaSeleccionada(target.value);
  };

  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="modal">
        <div className="modal-body">
          <select value={medidaSeleccionada} onChange={handleChange}>
            {medidas?.map((medida, index) => (
              <option key={index} value={index}>
                {medida.Descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-botonera">
          <button onClick={onClose}>CerrarModal</button>
          <button onClick={onSabe(medidaSeleccionada)}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};
export default CargaProductos;
