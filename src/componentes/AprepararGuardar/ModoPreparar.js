import { useState, useEffect } from "react";
import ModoPesar from "./ModoPesar";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const ModoPreparar = ({ pedido, salir, onGuardar }) => {
  const [pedidoApreparar, setPedidoApreparar] = useState(pedido);
  const [productoApesar, setProductoApesar] = useState();
  const [prodData, setProdData] = useState({});
  const { push } = useHistory();
  const obtenerPedidos = async (prod) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("auth"));
      const result = await fetch(
        `${BASE_URL}iProductosSP/ProductosDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );

      if (result.status !== 200) {
        if (result.status === 401) return push("/");
        throw new Error("error al obtener los pedidos");
      }

      const json = await result.json();
      setProdData(() => json.find(({ Codigo }) => prod.Codigo === Codigo));
    } catch (err) {
      console.log(err);
      toast.error(err);
    }
  };

  /* Manejadores de eventos */
  const handlePesar = (productoApesar) => (e) => {
    setProductoApesar(productoApesar);
    obtenerPedidos(productoApesar);
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
    if (
      ProductoPesado[producto.index].CantidadAnterior <=
      ProductoPesado[producto.index].Cantidad
    ) {
      ProductoPesado[producto.index].NuevoPedido = false;
      ProductoPesado[producto.index].DesecharFaltante = false;
    }

    setPedidoApreparar({ ...pedidoApreparar, Productos: ProductoPesado });
    setProductoApesar(undefined);
  };

  const handleEliminarPesaje = (index) => (e) => {
    let ProductoPesado = pedidoApreparar.Productos;
    ProductoPesado[index].Pesaje = undefined;
    ProductoPesado[index].Cantidad = ProductoPesado[index].CantidadAnterior;
    setPedidoApreparar({
      ...pedidoApreparar,
      Productos: ProductoPesado,
    });
  };
  const handleDescartarNuevoClick = (tipo, indexProd) => (e) => {
    const pedidoTemp = pedidoApreparar;
    const Tipos = {
      Descartar: () => {
        pedidoTemp.Productos[indexProd].DesecharFaltante = true;
        pedidoTemp.Productos[indexProd].NuevoPedido = false;
      },
      Nuevo: () => {
        pedidoTemp.Productos[indexProd].NuevoPedido = true;
        pedidoTemp.Productos[indexProd].DesecharFaltante = false;
      },
    };
    Tipos[tipo]();
    setPedidoApreparar({ ...pedidoTemp });
  };
  const handleCancelarPesaje = (e) => {
    setProductoApesar(null);
  };
  console.log(pedidoApreparar);

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
            className="fas fa-window-close btn btn-red"
          ></button>
          <button
            disabled={pedidoApreparar.Productos.some(
              ({
                NuevoPedido,
                DesecharFaltante,
                Pesaje,
                Cantidad,
                CantidadAnterior,
              }) => {
                if (!Pesaje && !NuevoPedido && !DesecharFaltante) {
                  return true;
                }
                if (
                  CantidadAnterior > Cantidad &&
                  !NuevoPedido &&
                  !DesecharFaltante
                ) {
                  return true;
                }
                return false;
              }
            )}
            onClick={onGuardar(pedidoApreparar)}
            className="btn"
          >
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
            (
              {
                Codigo,
                Presentacion,
                Cantidad,
                Medida,
                Pesaje,
                pesoMaximo,
                pesoMinimo,
                NuevoPedido,
                DesecharFaltante,
                CantidadAnterior,
              },
              indexProd
            ) => (
              <tr key={indexProd}>
                <td>{Codigo}</td>
                <td>
                  <span className="titulo">{Presentacion}</span>
                  <div style={{ display: "flex" }}>
                    <div
                      hidden={
                        !(
                          Pesaje === undefined ||
                          CantidadAnterior === null ||
                          CantidadAnterior > Cantidad
                        )
                      }
                    >
                      <button
                        title="Presione para cargar el faltante a un nuevo pedido"
                        onClick={handleDescartarNuevoClick("Nuevo", indexProd)}
                        className={`boton nuevo ${
                          NuevoPedido ? "seleccionado" : ""
                        }`}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                      <button
                        title="Presione para desechar el faltante"
                        onClick={handleDescartarNuevoClick(
                          "Descartar",
                          indexProd
                        )}
                        className={`boton eliminar ${
                          DesecharFaltante ? "seleccionado" : ""
                        }`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    {!Pesaje ? (
                      <button
                        onClick={handlePesar({
                          ...pedidoApreparar.Productos[indexProd],
                          index: indexProd,
                        })}
                        className="boton pesaje"
                      >
                        Pesar
                      </button>
                    ) : (
                      <button
                        className="boton pesaje"
                        onClick={handleEliminarPesaje(indexProd)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
                <td>{`${Cantidad} ${Medida}`}</td>
                <td>{`${Pesaje?.PesoNeto || 0}`}</td>
                <td
                  className={`${
                    Pesaje?.PesoPorPieza > 0 &&
                    (Pesaje?.PesoPorPieza < pesoMinimo ||
                      Pesaje?.PesoPorPieza > pesoMaximo)
                      ? "pesoRojo"
                      : ""
                  }`}
                >{`${Pesaje?.PesoPorPieza || 0}`}</td>
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
      prodData={prodData}
    />
  );
};

export default ModoPreparar;
