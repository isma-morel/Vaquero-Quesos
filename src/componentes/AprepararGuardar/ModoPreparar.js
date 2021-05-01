import { useState } from "react";
import ModoPesar from "./ModoPesar";

const ModoPreparar = ({ pedido, salir, onGuardar }) => {
  const [pedidoApreparar, setPedidoApreparar] = useState(pedido);
  const [productoApesar, setProductoApesar] = useState();

  /* Manejadores de eventos */
  const handlePesar = (productoApesar) => (e) => {
    setProductoApesar(productoApesar);
  };
  const handleGuardarPesaje = (pesaje) => (e) => {
    const { producto, PesoBruto, Taras, PesoPorPieza, PesoNeto } = pesaje;
    let ProductoPesado = pedidoApreparar.Productos;
    ProductoPesado[producto.index].Pesaje = {
      PesoBruto,
      Taras,
      PesoPorPieza,
      PesoNeto,
    };
    ProductoPesado[producto.index].CantidadAnterior =
      ProductoPesado[producto.index].Cantidad;
    ProductoPesado[producto.index].Cantidad = producto.Cantidad;

    setPedidoApreparar({ ...pedidoApreparar, Productos: ProductoPesado });
    setProductoApesar(undefined);
  };

  const handleEliminarPesaje = (index) => (e) => {
    let ProductoPesado = pedidoApreparar.Productos;
    ProductoPesado[index].Pesaje = null;
    ProductoPesado[index].Cantidad = ProductoPesado[index].CantidadAnterior;
    setPedidoApreparar({
      ...pedidoApreparar,
      Productos: ProductoPesado,
    });
  };
  const handleCancelarPesaje = (e) => {
    setProductoApesar(null);
  };

  return !productoApesar ? (
    <div className="contenedor-tabla">
      <div className="contenedor-cliente">
        <div className="datos">
          <span>Cliente: {pedidoApreparar.Cliente}</span>

          <span>Pedido: {pedidoApreparar.Pedido}</span>

          <span>Fecha: {pedidoApreparar.Fecha}</span>
        </div>
        <div className="botones">
          <button
            onClick={salir}
            className="fas fa-window-close btn btn-red"></button>
          <button
            disabled={pedidoApreparar.Productos.some(({ Pesaje }) => !Pesaje)}
            onClick={onGuardar(pedidoApreparar)}
            className="btn">
            Guardar
          </button>
        </div>
      </div>
      <table className="tabla tabla-pedidos tabla-preparar">
        <thead>
          <tr>
            <th>CODIGO</th>
            <th>PRESENTACION</th>
            <th>CANTIDAD</th>
            <th>PESO</th>
            <th>PESO POR PIEZA</th>
          </tr>
        </thead>
        <tbody>
          {pedidoApreparar.Productos?.map(
            ({ Codigo, Presentacion, Cantidad, Medida, Pesaje }, indexProd) => (
              <tr key={indexProd}>
                <td>{Codigo}</td>
                <td>
                  <span className="titulo">{Presentacion}</span>
                  {!Pesaje ? (
                    <button
                      onClick={handlePesar({
                        ...pedidoApreparar.Productos[indexProd],
                        index: indexProd,
                      })}
                      className="btn">
                      Pesar
                    </button>
                  ) : (
                    <button
                      className="btn"
                      onClick={handleEliminarPesaje(indexProd)}>
                      Cancelar
                    </button>
                  )}
                </td>
                <td>{`${Cantidad} ${Medida}`}</td>
                <td>{`${Pesaje?.PesoNeto || 0}`}</td>
                <td>{`${Pesaje?.PesoPorPieza || 0}`}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
      <hr />
    </div>
  ) : (
    <ModoPesar
      producto={productoApesar}
      onGuardar={handleGuardarPesaje}
      onCancelar={handleCancelarPesaje}
    />
  );
};

export default ModoPreparar;
