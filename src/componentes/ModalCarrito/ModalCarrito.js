import React, { useState, useEffect } from "react";

const ModalCarrito = ({ isOpen, onClose, Producto }) => {
  const [producto, setProducto] = useState(Producto);
  useEffect(() => {
    setProducto(Producto);
  }, [Producto]);

  const handleChangeSelect = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: value });
  };
  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto">
        <div className="texto-producto">
          <h2 className="producto">{producto.producto}</h2>
          <h3 className="descripcion">{producto.descripcion}</h3>

          <input
            name="cantidad"
            type="number"
            placeholder="Cantidad"
            min={0}
            value={producto.cantidad || ""}
            step={0.1}
            onChange={handleChangeSelect}
          />
          <select
            name="unidad"
            id=""
            onChange={handleChangeSelect}
            value={producto.unidad}>
            <option value="KG.">KG.</option>
            <option value="Pallet.">Pallet.</option>
            <option value="Lts.">Lts.</option>
            <option value="Grs.">Grs.</option>
          </select>
          <br />
          <button className="boton" onClick={onClose}>
            Volver a la lista
          </button>
          <button className="boton">Modificar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalCarrito;
