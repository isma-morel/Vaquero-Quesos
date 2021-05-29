import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./CargaProductos.css";

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
  return (
    <div style={{ minHeight: "100%", width: "100%" }}>
      <div
        style={{
          display: "flex",
          width: "80%",
          alignItems: "center",
          justifyContent: "center",
          gap: "2em",
          margin: "auto",
        }}>
        <div
          style={{
            display: "flex",
            overflow: "hidden",
            flexDirection: "column",
            gap: ".2em",
          }}>
          <img
            style={{
              width: "200px",
              height: "200px",
              borderRadius: ".2em",
              margin: "auto",
            }}
            src="https://quesosvaquero.com/img/quesos/Parmesano-media-horma.jpg"
            alt=""
          />
          <button style={{ width: "100px", margin: "auto" }}>Subir</button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            alignSelf: "flex-start",
            gap: "1em",
          }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Codigo</span>
            <input type="text" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Descripcion</span>
            <input type="text" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Presentacion</span>
            <input type="text" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Medida Principal</span>
            <input type="text" />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            alignSelf: "flex-start",
            gap: "1em",
          }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Peso Promedio</span>
            <input type="text" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Porcentaje de Desvio</span>
            <input type="text" />
          </div>
        </div>
        <div></div>
      </div>
      <div style={{ width: "100%", textAlign: "center", padding: "2em" }}>
        <button
          style={{ margin: "auto", marginRight: "1em" }}
          onClick={onClose}>
          Cancelar
        </button>
        <button style={{ margin: "auto" }}>Guardar</button>
      </div>
    </div>
  );
};

export default CargaProductos;
