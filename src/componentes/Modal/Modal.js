import { granVaquero } from "../../GranVaquero.json";
import "./Modal.css";
const Modal = ({ isOpen, onClose }) => {
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
          <h3 className="descripcion"> Horma</h3>
          <button className="boton" onClick={onClose}>
            Volver a la lista
          </button>
          <button className="boton">Agregar al carrito</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
