import { granVaquero } from "../../GranVaquero.json";
import "./Modal.css";
const Modal = ({ isOpen, onClose, producto }) => {
  const handleGuardarProducto = (e) => {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito = [...carrito, { prod: "asd" }];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    onClose();
  };

  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto">
        <img
          className="imagen-producto"
          src={granVaquero}
          alt="Imagen ilustrativa"
        />
        <div className="texto-producto">
          <h2 className="producto">Gran Vaquero</h2>
          <h3 className="descripcion">Horma</h3>
          <input name="cantidad" type="number" placeholder="Cantidad" min={0} />
          <select name="" id="">
            <option value="">kg</option>
            <option value="">pack</option>
            <option value="">pallet</option>
          </select>
          <br />
          <button className="boton" onClick={onClose}>
            Volver a la lista
          </button>
          <button onClick={handleGuardarProducto} className="boton">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
