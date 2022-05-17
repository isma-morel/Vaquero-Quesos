import { useState, useEffect } from "react";
import ModoPesar from "./ModoPesar";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const calcularTara = (tara) => {
  let tarasTemp = tara;
  tarasTemp.TaraTotal = 0;
  tarasTemp.Taras.forEach((tara) => {
    tarasTemp.TaraTotal += tara.subTotal;
  });
  return tarasTemp;
};

const ModoPreparar = ({ pedido, salir, onGuardar }) => {
  const [pedidoApreparar, setPedidoApreparar] = useState(pedido);
  const [productoApesar, setProductoApesar] = useState();
  const [prodData, setProdData] = useState({});
  const [taras, setTaras] = useState([]);
  const [pesajesProvisorios, setPesajesProvisorios] = useState([]);
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

  const obtenerPesajesProvisorios = async () => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("auth"));
      const result = await fetch(
        `${BASE_URL}iPedidosSP/datosPesosProvisorios?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );
      if (result.status !== 200) {
        if (result.status === 401) return push("/");
        throw new Error("Error al obtener pesajes provisorios");
      }

      const json = await result.json();
      setPesajesProvisorios(json);
    } catch (err) {
      console.log(err);
      toast.error(err);
    }
  };

  const handlePesajeProvisorio = async (obj) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("auth"));
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PrepararProvisorioGuardar?pUsuario=${auth.usuario}&pToken=${auth.Token}&pIdClienteRegistro=${pedido.IdCliente}`,
        {
          method: "POST",
          body: JSON.stringify(obj),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (result.status !== 200) {
        if (result.status === 401) return push("/");
        throw new Error("error al guardar pesaje provisorio");
      }
      console.log("pesaje provisorio guardado");
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
    const getObj = [
      ProductoPesado.find(
        ({ idPedidosProd }) => idPedidosProd === pesaje.producto.idPedidosProd
      ),
    ];
    const pesajeProvisorioFind = getObj.map(
      ({ Cantidad, idPedidosProd, idMedidaPrinc, Pesaje }) => ({
        idPedidosProd: idPedidosProd,
        idMedidaPrinc: idMedidaPrinc,
        Cantidad: Cantidad,
        PesoBruto: Pesaje.PesoBruto,
        Tara: Pesaje.Taras.map(({ IdElemTara, cantidad, Peso, $id }) => ({
          $id: $id,
          idPedidosProd: idPedidosProd,
          IdElemTara: IdElemTara,
          Cantidad: cantidad,
          Peso: Peso,
        })),
      })
    );
    handlePesajeProvisorio(pesajeProvisorioFind[0]);
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

  const pedirTaras = async () => {
    const user = JSON.parse(sessionStorage.getItem("auth")) || {};
    let tarasTemp = [];
    try {
      const result = await fetch(
        `${BASE_URL}iElemTaraSP/ElementosTaraDatos?pUsuario=${user.usuario}&pToken=${user.Token}`
      );
      if (result.status !== 200) {
        throw new Error(result.text);
      }
      const json = await result.json();
      json.forEach((tara) =>
        tarasTemp.push({
          ...tara,
          subTotal: 0,
          cantidad: 0,
          PesoEditable: !tara.Peso,
        })
      );
      setTaras(tarasTemp);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    pedirTaras();
  }, []);

  useEffect(() => {
    obtenerPesajesProvisorios();
  }, []);
  useEffect(() => {
    pedidoApreparar.Productos.forEach((element, index) => {
      let taraFinal = {};

      const pesajeProvisorio =
        pesajesProvisorios.ProductosPesados &&
        pesajesProvisorios.ProductosPesados.find(
          ({ idPedidosProd }) => idPedidosProd === element.idPedidosProd
        );

      if (pesajeProvisorio) {
        const tarasProvisorio = taras.map((itemTara) => {
          const elemProvisorio = pesajeProvisorio.Tara.find(
            ({ IdElemTara, idPedidosProd }) =>
              IdElemTara === itemTara.IdElemTara &&
              element.idPedidosProd === idPedidosProd
          );
          itemTara.cantidad = elemProvisorio.Cantidad;
          itemTara.Peso = elemProvisorio.Peso;
          itemTara.subTotal = elemProvisorio.Cantidad * elemProvisorio.Peso;
          return itemTara;
        });
        console.log(tarasProvisorio);
        if (prodData.EsPesoFijo) {
          element.Cantidad = pesajeProvisorio.Cantidad;
          const pesajesProvisoriosFijos = {
            TaraTotal: 0,
            PesoNeto: parseFloat(
              pesajeProvisorio.Cantidad * prodData.PesoPromedio
            ).toFixed(2),
            PesoPorPieza: parseFloat(
              pesajeProvisorio.Cantidad * prodData.PesoPromedio
            ).toFixed(2),
            PesoBruto: pesajeProvisorio.PesoBruto,
            Taras: tarasProvisorio,
            producto: element,
          };
          taraFinal = calcularTara(pesajesProvisoriosFijos);

          taraFinal.TaraTotal !== 0
            ? (taraFinal.PesoBruto = parseFloat(
                taraFinal.producto.Cantidad * prodData.PesoPromedio +
                  taraFinal.TaraTotal
              ).toFixed(2))
            : (taraFinal.PesoBruto = parseFloat(
                taraFinal.producto.Cantidad * prodData.PesoPromedio
              ).toFixed(2));
          taraFinal.PesoNeto = parseFloat(
            taraFinal.PesoBruto - taraFinal.TaraTotal
          ).toFixed(2);
          taraFinal.PesoPorPieza = parseFloat(
            taraFinal.PesoNeto / pesajesProvisoriosFijos.producto.Cantidad
          ).toFixed(2);
        } else {
          element.Cantidad = pesajeProvisorio.Cantidad;
          const pesajesProvisoriosFijos = {
            TaraTotal: 0,
            PesoNeto: 0,
            PesoPorPieza: 0,
            PesoBruto: pesajeProvisorio.PesoBruto,
            Taras: tarasProvisorio,
            producto: element,
          };
          taraFinal = calcularTara(pesajesProvisoriosFijos);
          if (taraFinal.PesoBruto !== 0) {
            taraFinal.PesoNeto = parseFloat(
              taraFinal.PesoBruto - taraFinal.TaraTotal
            ).toFixed(2);
            taraFinal.PesoPorPieza = parseFloat(
              taraFinal.PesoNeto / pesajesProvisoriosFijos.producto.Cantidad
            ).toFixed(2);
          }
        }
        const { producto, PesoBruto, Taras, PesoPorPieza, PesoNeto } =
          taraFinal;
        let ProductoPesado = pedidoApreparar.Productos;
        if (ProductoPesado[index].idPedidosProd === element.idPedidosProd) {
          ProductoPesado[index].Pesaje = {
            PesoBruto,
            Taras,
            PesoPorPieza,
            PesoNeto,
          };
          ProductoPesado[index].CantidadAnterior =
            ProductoPesado[index].Cantidad;
          ProductoPesado[index].Cantidad = producto.Cantidad;
          if (
            ProductoPesado[index].CantidadAnterior <=
            ProductoPesado[index].Cantidad
          ) {
            ProductoPesado[index].NuevoPedido = false;
            ProductoPesado[index].DesecharFaltante = false;
          }

          setPedidoApreparar({ ...pedidoApreparar, Productos: ProductoPesado });
        }
      }
    });
  }, [pesajesProvisorios, taras, prodData]);
  console.log(pedido);

  return !productoApesar ? (
    <div className="contenedor-tabla">
      {console.log(pesajesProvisorios)}
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
          {console.log(pedidoApreparar.Productos)}
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
      pesajeProvisorio={pesajesProvisorios.ProductosPesados.find(
        ({ idPedidosProd }) => productoApesar.idPedidosProd === idPedidosProd
      )}
      onGuardar={handleGuardarPesaje}
      onCancelar={handleCancelarPesaje}
      prodData={prodData}
      pedirData={obtenerPedidos}
    />
  );
};

export default ModoPreparar;
