import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./CargaProductos.css";
import "./AddOrEdit.css";
import useModal from "../../hooks/useModal";

const obtenerImagen = (imagen) =>
  new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onloadend = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = function (e) {
      reject(e.target.error);
    };
    reader.readAsDataURL(imagen);
  });

const procesarProductoParaGuardar = ({
  IdProducto,
  Descripcion,
  Presentacion,
  Codigo,
  Inactivo,
  PesoPromedio,
  PorcDesvio,
  medidaPrincipal,
  Medidas,
  pFoto,
}) => ({
  pIdProducto: IdProducto || 0,
  pDescripcion: Descripcion,
  pCodigo: Codigo,
  pIdMedidaPrinc: medidaPrincipal || Medidas[0].IdMedida,
  pPresentacion: Presentacion,
  PesoPromedio: PesoPromedio || 0,
  PorcDesvio: PorcDesvio || 0,
  Inactivo: Inactivo || false,
  pFoto: pFoto || null,
  pMedidas: Medidas,
});

/* Formulario de listado de productos */
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
    obtenerPedidos();
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

/* Formulario de carga de productos */
const AddOrEdit = ({
  productoSeleccionado,
  setProductoSeleccionado,
  onClose,
}) => {
  const referencedElement = useRef();
  const [isLoading, setIsLoading] = useState(false);
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
    let medidas = [...productoSeleccionado?.Medidas] || [];
    pedirMedidas();
    medidas.splice(0, 1);
    setInputs({
      ...inputs,
      medidaPrincipal: productoSeleccionado?.Medidas?.[0]?.IdMedida || 0,
      Medidas: medidas,
    });
    if (productoSeleccionado?.TieneFoto) {
      pedirFoto();
    }
  }, []);

  const onFileChange = (e) => {
    setImagen(e.target.files[0]);
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setInputs({
      ...inputs,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value)
          : value,
    });
  };
  const handleSabeModal = (medidaSeleccionada) => (e) => {
    if (
      inputs?.Medidas?.some(
        (medida) =>
          medida.DescripcionUM === medidas[medidaSeleccionada].Descripcion
      )
    )
      return;

    const Medidas = inputs?.Medidas || [];

    Medidas.push({
      ...medidas[medidaSeleccionada],
      DescripcionUM: medidas[medidaSeleccionada].Descripcion,
      Factor: 0,
    });
    handleModal();
    setInputs({
      ...inputs,
      ["medidaPrincipal"]: medidas[medidaSeleccionada].IdMedida,
    });
  };
  const handleRemove = (index) => (e) => {
    const Medidas = productoSeleccionado.Medidas;
    Medidas.splice(index, 1);

    setProductoSeleccionado({ ...productoSeleccionado, Medidas });
  };
  const handleMedidaChange = (index) => (e) => {
    const { value } = e.target;

    let productoSeleccionadoTemp = inputs;

    productoSeleccionadoTemp.Medidas[index].Factor = parseFloat(value);

    setInputs({ ...productoSeleccionadoTemp });
  };

  const handleGuardar = async (e) => {
    let foto = null;
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth) return push("/");
    setIsLoading(true);
    try {
      if (imagen) {
        foto = await obtenerImagen(imagen);
        foto = foto.split(",")[1];
      }
      const productoAGuardar = procesarProductoParaGuardar({
        ...inputs,
        pFoto: foto,
      });
      const result = await fetch(
        `${BASE_URL}iProductosSP/Guardar?pUsuario=${auth.usuario}&pToken=${auth.Token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productoAGuardar),
        }
      );

      if (result.status !== 200) {
        if (result.status === 401) {
          push("/");
        }
        throw new Error(result.message);
      }

      const json = await result.json();
    } catch (error) {
      console.log(error);
      toast.error("se produjo un error");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return isLoading ? (
    <div className="spin"></div>
  ) : (
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
              type="number"
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
              {inputs?.Medidas?.map((medida) => (
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
          {inputs?.Medidas.map((medida, index) => (
            <div>
              <span>
                {medida.DescripcionUM}
                <i
                  onClick={handleRemove(index)}
                  style={{ marginLeft: "1em", cursor: "pointer" }}
                  className="fas fa-times"></i>
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                onChange={handleMedidaChange(index)}
                value={medida.Factor}
              />
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
        <button className="boton" onClick={handleGuardar}>
          Guardar
        </button>
      </div>
    </div>
  );
};

/* Formulario de medidas */
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
