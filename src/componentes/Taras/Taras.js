import { useEffect, useState } from "react";
import { BASE_URL } from "../../BaseURL.json";
import { toast } from "react-toastify";
import "./Taras.css";
import { useHistory } from "react-router";

const Filtrar = (value, taras) => {
  let resultado = taras;
  resultado = resultado.filter((tara) =>
    tara.Descripcion.toUpperCase().includes(value.toUpperCase())
  );
  return resultado;
};
//iElemTaraSP/ElementosTaraDatos?pUsuario=1&pToken=980592
const Taras = () => {
  const [taras, setTaras] = useState();
  const [tarasFiltradas, setTarasFiltradas] = useState();
  const [isLoading, setIsLoading] = useState(false);
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
                      <button className="btn edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn remove">
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

export default Taras;
