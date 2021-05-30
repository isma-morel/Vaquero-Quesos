import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./CargaProductos.css";
import "./AddOrEdit.css";
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
    setProductoSeleccionado(productos[index]);
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

const AddOrEdit = ({ productoSeleccionado, onClose }) => {
  const referencedElement = useRef();
  const [imagen, setImagen] = useState();
  const [medidas, setMedidas] = useState([]);
  const [inputs, setInputs] = useState({
    ...productoSeleccionado,
  });
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
      console.table(json);
      setMedidas(json);
    } catch (err) {
      toast.error("ocurrio un error.");
      console.log(err);
    }
  };
  const pedirFoto = async () => {
    try {
      const result = await fetch(
        `${BASE_URL}iProductosSP/Foto?idProducto=${productoSeleccionado.IdProducto}`
      );
      const json = await result.json();
      setImagen(`data:image/png;base64,${json.Foto}`);
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

  return (
    <div className="AddOrEdit">
      <div className="contenedor">
        <div className="contenedor-imagen">
          <img
            className="imagen"
            src={
              imagen
                ? typeof imagen !== "string"
                  ? URL.createObjectURL(imagen)
                  : imagen
                : ""
            }
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
            <input type="text" name="Codigo" value={inputs["Codigo"]} />
          </div>
          <div>
            <span>Descripcion</span>
            <input
              type="text"
              name="Descripcion"
              value={inputs["Descripcion"]}
            />
          </div>
          <div>
            <span>Presentacion</span>
            <input
              type="text"
              name="Presentacion"
              value={inputs["Presentacion"]}
            />
          </div>
          <div>
            <span>Medida Principal</span>
            <input type="text" />
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
              value={inputs["PorcDesvio"]}
            />
          </div>
          <div>
            <label htmlFor="Inactivo">
              {inputs["Inactivo"] ? "true" : "false"}
            </label>
            <input
              hidden
              type="checkbox"
              name="Inactivo"
              id="Inactivo"
              checked={inputs["Inactivo"]}
            />
          </div>
        </div>
        <div className="contenedor-medidas"></div>
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

export default CargaProductos;
