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
  const handleClick = (e) => {
    const { name } = e.target;
    if (name === "plus") {
      setInputs({
        ...inputs,
        cantidad: inputs.cantidad >= 0 ? inputs.cantidad + 1 : 0,
      });
    } else {
      setInputs({
        ...inputs,
        cantidad: inputs.cantidad >= 0 ? inputs.cantidad - 1 : 0,
      });
    }
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
          <div className="input">
            <button
              name="minus"
              onClick={handleClick}
              disabled={!inputs.cantidad}
              className="fas fa-minus boton-input"></button>

            <input
              name="cantidad"
              onChange={handleChange}
              type="number"
              step={1}
              value={inputs.cantidad}
              min={0}
            />
            <button
              name="plus"
              onClick={handleClick}
              className="fas fa-plus boton-input"></button>
          </div>
          <div className="radios">
            {producto.Medidas?.map((medida, index) => (
              <div key={index}>
                <input
                  onChange={handleChange}
                  type="radio"
                  name="medida"
                  id={medida.DescripcionUM}
                  checked={inputs.medida === medida.IdMedida}
                  key={medida.IdMedida}
                  value={medida.IdMedida}
                />
                <label htmlFor={medida.DescripcionUM}>
                  {medida.DescripcionUM}
                </label>
              </div>
            ))}
          </div>
          <br />
          <button className="boton" onClick={handleVolver}>
            Volver a la lista
          </button>
          <button
            onClick={handleGuardarProducto}
            className="boton btn-secondary">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
