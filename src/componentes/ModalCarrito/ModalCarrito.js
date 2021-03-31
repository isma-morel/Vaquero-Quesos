import React, { useState, useEffect } from "react";

const ModalCarrito = ({ isOpen, onClose, ProductoIndex, setProductos }) => {
  const [producto, setProducto] = useState();

  useEffect(() => {
    /* efecto encargado de obtener el producto que se va a editar. */
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productoEditado = carrito[ProductoIndex];

    setProducto(productoEditado);
  }, [ProductoIndex, isOpen]);

  const handleChangeSelect = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: parseInt(value) });
  };

  const handleConfirmar = (e) => {
    const carrito = JSON.parse(localStorage.getItem("carrito"));
    carrito[ProductoIndex] = producto;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    setProductos(carrito);
    onClose();
  };

  return producto ? (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto">
        <div className="texto-producto">
          <h2 className="producto">{producto.Descripcion}</h2>
          <h3 className="descripcion">{producto.Presentacion}</h3>

          <input
            name="cantidad"
            type="number"
            placeholder="Cantidad"
            min={0}
            value={producto.cantidad}
            step={1}
            onChange={handleChangeSelect}
          />

          <select
            name="medida"
            id=""
            onChange={handleChangeSelect}
            value={producto.medida}>
            {producto.Medidas?.map((medida) => (
              <option key={medida.IdMedida} value={medida.IdMedida}>
                {medida.DescripcionUM}
              </option>
            ))}
          </select>

          <br />
          <button onClick={handleConfirmar} className="boton btn-secondary">
            Modificar
          </button>
          <button className="boton" onClick={onClose}>
            Volver a la lista
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ModalCarrito;
