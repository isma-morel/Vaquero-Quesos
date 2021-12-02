import { useState, useEffect } from "react";

const ModalCarrito = ({ isOpen, onClose, ProductoIndex, setProductos }) => {
  const [producto, setProducto] = useState();
  useEffect(() => {
    /* efecto encargado de obtener el producto que se va a editar. */
    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
    const productoEditado = carrito[ProductoIndex];
    setProducto(productoEditado);
  }, [ProductoIndex, isOpen]);

  const handleChangeSelect = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: parseInt(value) });
  };
  const handleClick = (e) => {
    const { name } = e.target;
    if (name === "plus") {
      setProducto({
        ...producto,
        cantidad: producto.cantidad >= 0 ? producto.cantidad + 1 : 0,
      });
    } else {
      setProducto({
        ...producto,
        cantidad: producto.cantidad >= 0 ? producto.cantidad - 1 : 0,
      });
    }
  };

  const handleConfirmar = (e) => {
    const carrito = JSON.parse(sessionStorage.getItem("carrito"));
    carrito[ProductoIndex] = producto;
    sessionStorage.setItem("carrito", JSON.stringify(carrito));
    setProductos(carrito);
    onClose();
  };

  return producto ? (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto">
        <div className="texto-producto">
          <div className="title-producto">
            <h2 className="producto">{producto.Descripcion}</h2>
            <h3 className="descripcion">{producto.Presentacion}</h3>
          </div>
          <div className="input">
            <button
              name="minus"
              onClick={handleClick}
              disabled={!producto.cantidad}
              className="fas fa-minus boton-input"
            ></button>

            <input
              name="cantidad"
              onChange={handleChangeSelect}
              type="number"
              value={producto.cantidad}
              min={0}
            />
            <button
              name="plus"
              onClick={handleClick}
              className="fas fa-plus boton-input"
            ></button>
          </div>
          <div className="radios">
            {producto.Medidas?.map((medida, index) => (
              <div key={index}>
                <input
                  onChange={handleChangeSelect}
                  type="radio"
                  name="medida"
                  id={medida.DescripcionUM}
                  checked={medida.IdMedida === producto.medida}
                  value={medida.IdMedida}
                />
                <label htmlFor={medida.DescripcionUM}>
                  {medida.DescripcionUM}
                </label>
              </div>
            ))}
          </div>
          <br />
          <button className="boton" onClick={onClose}>
            Volver a la lista
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!producto.cantidad}
            className="boton btn-secondary"
          >
            Modificar
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ModalCarrito;
