import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./AprepararGuardar.css";

const ProcesarPedido = (pedidos) => {
  let pedidosProcesados = [];
  if (Object.keys(pedidos).length === 0) return [];
  pedidosProcesados = pedidos.Resumido.reduce((acum, actual) => {
    let resultado = {
      ...actual,
      Fecha: new Date(actual.Fecha).toLocaleDateString(),
      Productos: [],
    };
    pedidos.Detallado.forEach(
      ({
        IdPedido,
        idPedidosProd,
        Codigo,
        Presentacion,
        Cantidad,
        Medida,
        IdMedidaPrinc,
      }) => {
        if (actual.IdPedido === IdPedido) {
          resultado.Productos.push({
            idPedidosProd,
            Codigo,
            Presentacion,
            Cantidad,
            IdMedidaPrinc,
            Medida,
          });
        }
      }
    );
    return [...acum, resultado];
  }, []);
  return pedidosProcesados;
};

const FiltrarCliente = (cliente, pedidos) => {
  return pedidos.filter((pedido) => pedido.Cliente.includes(cliente));
};
const FiltrarPedido = (id, pedidos) => {
  return pedidos.filter((pedido) => pedido.Pedido.toString().startsWith(id));
};
const Filtrar = (value, pedidos) => {
  const esNumero = /^[0-9]+$/;
  let resultado = pedidos;
  if (value.match(esNumero)) {
    resultado = FiltrarPedido(value, pedidos);
  } else {
    resultado = FiltrarCliente(value, pedidos);
  }
  return resultado;
};

const calcularTara = (tara) => {
  let tarasTemp = tara;
  tarasTemp.TaraTotal = 0;
  tarasTemp.Taras.forEach((tara) => {
    tarasTemp.TaraTotal += tara.subTotal;
  });
  return tarasTemp;
};
const ProcesarParaGuardar = (pedido) => {
  let PedidoProcesado = {};
  PedidoProcesado.Numero = pedido.Pedido;
  PedidoProcesado.Fecha = new Date(Date.now()).toISOString();
  PedidoProcesado.Productos = pedido.Productos.map(
    ({ idPedidosProd, IdMedidaPrinc, Cantidad, Pesaje }) => ({
      IdPreparado: 0,
      idPedidosProd,
      IdMedidaPrinc: IdMedidaPrinc || 1,
      Cantidad,
      PesoBruto: Pesaje.PesoBruto,
      Tara: Pesaje.Taras.map(({ IdElemTara, cantidad, Peso }) => ({
        IdPreparado: 0,
        idPedidosProd,
        IdElemTara,
        Cantidad: cantidad,
        Peso,
      })),
    })
  );
  return PedidoProcesado;
};

function AprepararGuardar() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [modoPreparar, setModoPreparar] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState({});
  const { push } = useHistory();
  const pedirPedidosAPreparar = async () => {
    let pedidosProcesados = [];
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    if (!Token) return;
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosParaPreparar?pUsuario=${usuario}&pToken=${Token}`
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          localStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      const json = await result.json();

      pedidosProcesados = await ProcesarPedido(json);

      setPedidos(pedidosProcesados);
    } catch (err) {
      toast.error("a ocurrido un error");
      console.log(err);
    }
  };
  const handleGuardarPreparacion = (pedido) => async (e) => {
    const pedidoProcesado = ProcesarParaGuardar(pedido);
    const auth = JSON.parse(localStorage.getItem("auth")) || {};
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PrepararGuardar?pUsuario=${auth.usuario}&pToken=${auth.Token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedidoProcesado),
        }
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          localStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      toast.success("Pedido guardado con exito");
      setModoPreparar(false);
      setPedidoSeleccionado({});
      pedirPedidosAPreparar();
    } catch (err) {
      toast.error("se ah producido un error");
      console.log(err);
    }
  };
  const handlePreparar = (producto) => (e) => {
    setPedidoSeleccionado(producto);
    setModoPreparar(true);
  };

  const handlePrepararCerrar = (e) => {
    setPedidos([]);
    pedirPedidosAPreparar();
    setPedidoSeleccionado({});
    setModoPreparar(false);
  };

  const handleChangeFiltro = (e) => {
    const resultado = Filtrar(e.target.value, pedidos);
    if (!resultado) return;
    setPedidosFiltrados(resultado);
  };

  useEffect(() => {
    setPedidosFiltrados(pedidos);
  }, [pedidos]);
  useEffect(() => {
    pedirPedidosAPreparar();
  }, []);

  return (
    <div className="preparar">
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />
          <span className="titulo">Preparación</span>
        </div>
        <hr />
      </div>
      {pedidos.length > 0 ? (
        !modoPreparar ? (
          pedidosFiltrados.map(
            ({ Cliente, Fecha, Productos, Pedido }, index) => (
              <div key={index} className="contenedor-tabla">
                <div className="contenedor-cliente">
                  <div className="datos">
                    <span>Cliente: {Cliente}</span>

                    <span>Pedido: {Pedido}</span>

                    <span>Fecha: {Fecha}</span>
                  </div>
                  <button
                    onClick={handlePreparar(pedidosFiltrados[index])}
                    className="btn">
                    Preparar
                  </button>
                </div>
                <table className="tabla tabla-pedidos">
                  <thead>
                    <tr>
                      <th>CODIGO</th>
                      <th>PRESENTACION</th>
                      <th>CANTIDAD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Productos?.map(
                      (
                        { Codigo, Presentacion, Cantidad, Medida, Pesaje },
                        indexProd
                      ) => (
                        <tr key={indexProd}>
                          <td>{Codigo}</td>
                          <td>
                            <span className="titulo">{Presentacion}</span>
                          </td>
                          <td>{`${Cantidad} ${Medida}`}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                <hr />
              </div>
            )
          )
        ) : (
          <ModoPreparar
            pedido={pedidoSeleccionado}
            salir={handlePrepararCerrar}
            onGuardar={handleGuardarPreparacion}
          />
        )
      ) : (
        <div className="spin"></div>
      )}
    </div>
  );
}

const ModoPreparar = ({ pedido, salir, onGuardar }) => {
  const [pedidoApreparar, setPedidoApreparar] = useState(pedido);
  const [productoApesar, setProductoApesar] = useState();
  const handlePesar = (productoApesar) => (e) => {
    setProductoApesar(productoApesar);
  };
  const handleGuardarPesaje = (pesaje) => (e) => {
    const { producto, PesoBruto, Taras, PesoPorPieza } = pesaje;
    let ProductoPesado = pedidoApreparar.Productos;
    ProductoPesado[producto.index].Pesaje = {
      PesoBruto,
      Taras,
      PesoPorPieza,
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
                <td>{`${Pesaje?.PesoBruto || 0}`}</td>
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

const ModoPesar = ({ producto, onGuardar, onCancelar }) => {
  const [pesaje, setPesaje] = useState({
    TaraTotal: 0,
    PesoNeto: 0,
    PesoPorPieza: 0,
    PesoBruto: 0,
    Taras: null,
    producto: producto,
  });
  const [editPiezas, setEditPiezas] = useState(false);
  const handleChangeBruto = (e) => {
    const { value } = e.target;

    calcular({ ...pesaje, PesoBruto: parseFloat(value) });
  };
  const handlePiezasClick = (e) => {
    if (!pesaje.producto.Cantidad) return;
    setEditPiezas(!editPiezas);
  };
  const handleChangePiezas = (e) => {
    const { value } = e.target;

    let tempProd = pesaje.producto;
    tempProd.Cantidad = parseFloat(value);
    calcular({ ...pesaje, producto: tempProd });
  };
  const handleChangePeso = (indice) => (e) => {
    const esNumero = /^[0-9]+([.])?([0-9]+)?$/;
    let taraTemp = pesaje.Taras;

    if (!e.target.innerText.trim().match(esNumero)) {
      e.target.innerHTML = "</br>";
      taraTemp[indice].Peso = 0;
      taraTemp[indice].subTotal = 0;
      calcular({ ...pesaje, Taras: taraTemp });
      return;
    }
    taraTemp[indice].subTotal =
      parseFloat(e.target.innerText) * parseFloat(taraTemp[indice].cantidad);
    taraTemp[indice].Peso = parseFloat(e.target.innerText);

    calcular({
      ...pesaje,
      Taras: taraTemp,
    });
  };
  const handleChange = (indice) => (e) => {
    const esNumero = /^[0-9]+([.])?([0-9]+)?$/;
    let taraTemp = pesaje.Taras;

    if (!e.target.innerText.trim().match(esNumero)) {
      e.target.innerHTML = "</br>";
      taraTemp[indice].subTotal = 0;
      taraTemp[indice].cantidad = 0;
      calcular({ ...pesaje, Taras: taraTemp });
      return;
    }
    taraTemp[indice].subTotal =
      parseFloat(e.target.innerText) * parseFloat(taraTemp[indice].Peso);
    taraTemp[indice].cantidad = parseFloat(e.target.innerText);

    calcular({
      ...pesaje,
      Taras: taraTemp,
    });
  };
  const pedirTaras = async () => {
    const user = JSON.parse(localStorage.getItem("auth")) || {};
    let tarasTemp = [];
    try {
      const result = await fetch(
        `${BASE_URL}iElemTara/ElementosTaraDatos?pUsuario=${user.usuario}&pToken=${user.Token}`
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
      setPesaje({ ...pesaje, Taras: tarasTemp });
    } catch (err) {
      console.log(err);
    }
  };
  const calcular = (taraTemp) => {
    let taraFinal = calcularTara(taraTemp);
    if (taraFinal.PesoBruto !== 0) {
      taraFinal.PesoNeto = taraFinal.PesoBruto - taraFinal.TaraTotal;
      taraFinal.PesoPorPieza = parseFloat(
        (taraFinal.PesoNeto / taraTemp.producto.Cantidad).toFixed(3)
      );
    }

    setPesaje(taraFinal);
  };

  useEffect(() => {
    pedirTaras();
  }, []);

  return (
    <div className="contenedor-tabla">
      <div className="contenedor-cliente">
        <div className="datos">
          <span>Codigo: {pesaje.producto.Codigo}</span>
          <span>Presentacion: {pesaje.producto.Presentacion}</span>
        </div>
      </div>
      <div className="form-tabla">
        <div className="form-pesaje">
          <div className="flex-input piezas-input">
            <label htmlFor="piezas">Piezas Totales</label>
            <div className="piezas-input-boton">
              <input
                min={0}
                type="number"
                name="piezas"
                id="piezas"
                disabled={!editPiezas}
                value={pesaje.producto.Cantidad}
                onChange={handleChangePiezas}
              />
              <button onClick={handlePiezasClick}>Cambiar</button>
            </div>
          </div>
          <div className="flex-input bruto-input">
            <label htmlFor="bruto">Peso Bruto</label>
            <input
              type="number"
              name="bruto"
              id="bruto"
              step={0.5}
              inputMode="decimal"
              onChange={handleChangeBruto}
              value={pesaje.PesoBruto}
            />
          </div>
          <div className="flex-input ">
            <div className="tara-input">
              <label htmlFor="tara">Tara</label>
              <input
                type="number"
                name="tara"
                id="tara"
                disabled
                value={pesaje.TaraTotal}
              />
            </div>
          </div>
          <div className="flex-input neto-input">
            <label htmlFor="neto">Peso Neto</label>
            <input
              disabled
              type="number"
              name="neto"
              id="neto"
              value={pesaje.PesoNeto}
            />
          </div>
          <div className="flex-input pesoPieza-input">
            <label htmlFor="pesoPieza">Peso por Pieza</label>
            <input
              disabled
              type="number"
              name="pesoPieza"
              id="pesoPieza"
              value={pesaje.PesoPorPieza}
            />
          </div>
          <div className="botones-form">
            <button onClick={onCancelar} className="boton-form boton-cancelar">
              Cancelar
            </button>
            <button
              disabled={!(pesaje.PesoPorPieza > 0)}
              onClick={onGuardar(pesaje)}
              className="boton-form">
              Guardar
            </button>
          </div>
        </div>
        <div className="tara-table">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Peso</th>
                <th>SubTotal</th>
              </tr>
            </thead>
            <tbody>
              {pesaje.Taras?.map((tara, index) => (
                <tr key={index}>
                  <td>{tara.Descripcion}</td>
                  <td
                    contentEditable
                    inputMode="decimal"
                    onSelect={handleChange(index)}></td>
                  {tara.PesoEditable ? (
                    <td onSelect={handleChangePeso(index)} contentEditable></td>
                  ) : (
                    <td>{tara.Peso}</td>
                  )}
                  <td>{tara.subTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AprepararGuardar;
