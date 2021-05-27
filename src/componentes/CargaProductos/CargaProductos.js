import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./CargaProductos.css";

const CargaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useHistory();
  const obtenerPedidos = async () => {
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

  return (
    <div className="carga-productos">
      {isLoading ? (
        <div className="spin"></div>
      ) : (
        <div className="contenedor-tabla">
          <div className="contenedor-cliente">
            <button className="btn add">Nueva</button>
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
              {productos.map(({ Codigo, Descripcion, Presentacion }) => (
                <tr onClick={() => alert("pene")}>
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

export default CargaProductos;
