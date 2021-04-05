import { useEffect, useState } from "react";
import { granVaquero } from "../../GranVaquero.json";
import { BASE_URL } from "../../BaseURL.json";
import "./Modal.css";
const Modal = ({ isOpen, onClose, producto }) => {
  const medidaDefault = producto.Medidas ? producto.Medidas[0].IdMedida : 0;
  const [inputs, setInputs] = useState({
    cantidad: 0,
    medida: medidaDefault,
  });
  const [foto, setFoto] = useState();
  useEffect(() => {
    const pedirFoto = async (idProducto) => {
      try {
        const result = await fetch(
          `${BASE_URL}iProductosSP/Foto?idProducto=${idProducto}`
        );
        if (result.status !== 200) {
          throw new Error("error al obtener la foto " + result.text());
        }
        const json = await result.json();
        setFoto(`data:image/png;base64,${json.Foto}`);
      } catch (err) {
        console.log(err);
      }
    };
    if (producto.TieneFoto) {
      pedirFoto(producto.IdProducto);
    } else {
      setFoto(null);
    }
  }, [producto]);

  const LimpiarImputs = () => {
    setInputs({ medida: medidaDefault, cantidad: 0 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: parseInt(value) });
  };

  const handleGuardarProducto = (e) => {
    if (inputs.cantidad === "") {
      return;
    }
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito = [...carrito, { ...producto, ...inputs }];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    LimpiarImputs();
    onClose();
  };
  const handleVolver = (e) => {
    LimpiarImputs();
    onClose();
  };

  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto">
        {producto.TieneFoto && (
          <img
            className="imagen-producto"
            src={foto}
            alt="Imagen ilustrativa"
          />
        )}
        <div className="texto-producto">
          <h2 className="producto">{producto.Descripcion}</h2>
          <h3 className="descripcion">{producto.Presentacion}</h3>
          <input
            name="cantidad"
            onChange={handleChange}
            type="number"
            value={inputs.cantidad}
            placeholder="Cantidad"
            min={0}
          />
          <select
            onChange={handleChange}
            value={inputs.medida}
            name="medida"
            id="">
            {producto.Medidas?.map((medida) => (
              <option key={medida.IdMedida} value={medida.IdMedida}>
                {medida.DescripcionUM}
              </option>
            ))}
          </select>
          <br />
          <button
            onClick={handleGuardarProducto}
            className="boton btn-secondary">
            Agregar al carrito
          </button>
          <button className="boton" onClick={handleVolver}>
            Volver a la lista
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
