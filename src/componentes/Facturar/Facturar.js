// import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import useModal from "../../hooks/useModal";
import "./Facturar.css";

/* Procesadores */
const ProcesarPedidosAFacturar = (pedidosBruto) => {
  let pedidosProcesados = [];
  pedidosProcesados = pedidosBruto.reduce(
    (
      acum,
      {
        idPedidosProd,
        Pedido,
        Cliente,
        Codigo,
        Presentacion,
        CantidadLista,
        Medida,
        Peso,
        A,
        B,
        idPedidosPrepProd,
        idPedido,
      }
    ) => {
      let prodTemp = {};
      const index = acum.findIndex((pedido) => pedido.Pedido === Pedido);

      if (index < 0) {
        prodTemp = {
          Pedido,
          Cliente,
          idPedido,
          A,
          B,
          Productos: [
            {
              idPedidosPrepProd,
              idPedidosProd,
              Codigo,
              Presentacion,
              CantidadLista,
              Medida,
              Peso,
            },
          ],
        };
        return [...acum, prodTemp];
      }
      acum[index].Productos.push({
        idPedidosPrepProd,
        idPedidosProd,
        Codigo,
        Presentacion,
        CantidadLista,
        Medida,
        Peso,
      });

      return [...acum];
    },
    []
  );
  return pedidosProcesados;
};
const ProcesarPedidoParaGuardar = ({ Pedido, A, B, Productos, idPedido }) => {
  const pedidoProcesado = {
    Numero: Pedido,
    Fecha: Date.now(),
    Productos: Productos.map(({ idPedidosPrepProd, CantidadLista, Peso }) => ({
      Cantidad: CantidadLista,
      idPedidosPrepProd,
      idPedido,
      Peso,
      A,
      B,
    })),
  };
  return pedidoProcesado;
};

/* Filtros */
const filtrarPedidoPorId = (id, pedidos) => {
  return pedidos.filter((pedido) => pedido.Pedido.toString().startsWith(id));
};

const filtrarPedidoPorCliente = (cliente, pedidos) => {
  return pedidos.filter((pedido) =>
    pedido.Cliente.toLowerCase().includes(cliente.toLowerCase())
  );
};

const filtrar = (value, pedidos) => {
  const esNumero = /^[0-9]+$/;
  let resultado = pedidos;
  if (value.match(esNumero)) {
    resultado = filtrarPedidoPorId(value, pedidos);
  } else {
    resultado = filtrarPedidoPorCliente(value, pedidos);
  }
  return resultado;
};

/**
 *
 * @param {*} url - url usado para insertar el pdf en el frame
 * @returns {String} iframe
 */
const Iframe = (url) =>
  `<iframe
    src=${url}
    frameborder="0"
    style="border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;"
    allowfullscreen></iframe>`;

const Facturar = ({ idPermiso }) => {
  const [isOpenModal, handleModal] = useModal();
  const [isOpenModalPeso, handleModalPeso] = useModal();
  const [pedidoId, setPedidoId] = useState(null);
  const [pedidoPesoFiltrado, setPedidoPesoFiltrado] = useState();
  const [pedidosAFacturarFiltrados, setPedidosAFacturarFiltrados] = useState();
  const [pedidosAFacturar, setPedidosAFacturar] = useState();
  const [pedidoAjustar, setPedidoAjustar] = useState();
  const { push } = useHistory();

  const pedirPedidosParaFacturar = async () => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    if (
      !auth.Token ||
      !auth.permisos.some(({ IdMenu }) => IdMenu === idPermiso)
    )
      return push("/");
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/ParaFacturar?pUsuario=${auth.usuario}&pToken=${auth.Token}`
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          sessionStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      const json = await result.json();
      console.log(json);
      const PedidosAFacturarProcesados = ProcesarPedidosAFacturar(json);
      setPedidosAFacturar(PedidosAFacturarProcesados);
    } catch (err) {
      toast.error("ha ocurrido un error");
      console.log(err);
    }
  };

  const getDetallePesaje = async () => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    const result = await fetch(
      `${BASE_URL}iPedidosSP/pedidoPesoDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}&pNumeroPedido=${pedidoId.Pedido}`
    );
    if (result.status !== 200) {
      if (result.status === 401) {
        sessionStorage.removeItem("auth");
        push("/");
      }
      throw new Error(result.statusText);
    }
    const json = await result.json();
    const { Productos, Taras } = json;
    const pesoFiltered = Productos.filter(
      ({ Id }) => Id === pedidoId.idPedidosPrepProd
    );
    const taraFiltered = Taras.filter(
      ({ Id }) => Id === pedidoId.idPedidosPrepProd
    );
    setPedidoPesoFiltrado([pesoFiltered[0], taraFiltered[0]]);
    handleModalPeso();
  };
  useEffect(() => {
    pedidoId && getDetallePesaje();
  }, [pedidoId]);

  /* Efectos */
  useEffect(() => {
    pedirPedidosParaFacturar();
  }, []);
  useEffect(() => {
    setPedidosAFacturarFiltrados(pedidosAFacturar);
  }, [pedidosAFacturar]);

  /* Manejadores de eventos */
  // const handleFiltroPedidoPeso = () => {
  //   const {Productos, Taras} = pedidosPeso;
  //   const pesoFiltered = Productos.filter(({Id}) => Id === pedidoId.idPedidosPrepProd)
  //   const taraFiltered = Taras.filter(({Id}) => Id=== pedidoId.idPedidosPrepProd)
  //   setPedidoPesoFiltrado([pesoFiltered[0], taraFiltered[0]])
  // }

  const handleChangeFiltro = (e) => {
    const resultado = filtrar(e.target.value, pedidosAFacturar);
    if (!resultado) return;
    setPedidosAFacturarFiltrados(resultado);
  };
  const handleEliminarPedido = (index) => async (e) => {
    console.log(pedidosAFacturarFiltrados[index]);
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/Eliminar?pUsuario=${auth.usuario}&pToken=${auth.Token}&pPedido=${pedidosAFacturarFiltrados[index].idPedido}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          sessionStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      toast.success("Facturación eliminada correctamente");
      setPedidosAFacturar(null);
      pedirPedidosParaFacturar();
    } catch (err) {
      toast.error("Ocurrio un error al eliminar la factura.");
      console.log(err.message);
    }
  };
  const handleAjustar = (index) => (e) => {
    setPedidoAjustar({ ...pedidosAFacturarFiltrados[index], index });
    handleModal();
  };
  const handleGuardar = ({ A, B, index }) => {
    const pedidosTemp = pedidosAFacturarFiltrados;
    pedidosTemp[index].A = A;
    pedidosTemp[index].B = B;
    setPedidosAFacturarFiltrados([...pedidosTemp]);
    setPedidoAjustar(null);
    handleModal();
  };
  const handleGuardarPedido = (index) => async (e) => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    const pedidoProcesado = ProcesarPedidoParaGuardar(
      pedidosAFacturarFiltrados[index]
    );
    console.log(pedidoProcesado);
    try {
      // const result = await axios({
      //   url: `${BASE_URL}iPedidosSP/FacturarGuardar?pUsuario=${auth.usuario}&pToken=${auth.Token}`,
      //   method: "POST",
      //   data: pedidoProcesado,
      // });
      const result = await fetch(
        `${BASE_URL}iPedidosSP/FacturarGuardar?pUsuario=${auth.usuario}&pToken=${auth.Token}`,
        {
          method: "POST",
          body: JSON.stringify(pedidoProcesado),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          sessionStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      toast.success("facturacion guardada correctamente");
      setPedidosAFacturar(null);
      pedirPedidosParaFacturar();
    } catch (err) {
      toast.error("ocurrio un error al guardar la factura.");
      console.log(err.message);
    }
  };
  return (
    <div className="contenedor-facturar">
      {console.log(pedidosAFacturar)}
      <ModalFactura
        isOpen={isOpenModal}
        onClose={handleModal}
        pedido={pedidoAjustar}
        onGuardar={handleGuardar}
      />
      <ModalDetallePedido
        isOpen={isOpenModalPeso}
        onClose={handleModalPeso}
        data={pedidoPesoFiltrado}
      />
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />
          <span className="titulo">{"Facturacion"}</span>
        </div>
        <hr />
      </div>
      {pedidosAFacturar ? (
        pedidosAFacturarFiltrados?.map(
          ({ Pedido, Cliente, Productos, A, B }, index) => (
            <div key={index} className="contenedor-tabla">
              <div className="contenedor-cliente">
                <div className="datos">
                  <span>Cliente: {Cliente}</span>
                  <span>Pedido: {Pedido}</span>
                </div>

                <span className="porcentajes">
                  A: {A}% - B: {B}%
                </span>

                <div className="botones">
                  <button
                    className="btn btn-cancelar"
                    onClick={handleEliminarPedido(index)}
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={handleAjustar(index)}
                    className="btn ajustar"
                  >
                    Ajustar
                  </button>
                  <button
                    onClick={handleGuardarPedido(index)}
                    disabled={!(A || B) || A + B !== 100}
                    className="btn"
                  >
                    Guardar
                  </button>
                </div>
              </div>
              <table className="tabla tabla-pedidos">
                <thead>
                  <tr>
                    <th>CODIGO</th>
                    <th>PRESENTACION</th>
                    <th>CANTIDAD LISTA</th>
                    <th>PESO</th>
                    <th>PESO POR PIEZA</th>
                  </tr>
                </thead>
                <tbody>
                  {Productos.map(
                    (
                      {
                        idPedidosPrepProd,
                        Codigo,
                        Presentacion,
                        CantidadLista,
                        Medida,
                        Peso,
                      },
                      indexProd
                    ) => (
                      <tr key={indexProd}>
                        <td>{Codigo}</td>
                        <td>
                          <div>
                            <span
                              className="titulo tituloPedidos"
                              onClick={() =>
                                setPedidoId({ Pedido, idPedidosPrepProd })
                              }
                            >
                              {Presentacion}
                            </span>
                          </div>
                        </td>
                        <td className="peso">{`${CantidadLista} ${
                          Medida || ""
                        }`}</td>
                        <td className="peso">
                          <span>{`${Peso} Kg`}</span>
                        </td>
                        <td className="peso">{`${parseFloat(
                          (Peso / CantidadLista).toFixed(2)
                        )} Kg`}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )
        )
      ) : (
        <div className="spin"></div>
      )}
    </div>
  );
};

/* Modales */
const ModalFactura = ({ isOpen, onClose, pedido, onGuardar }) => {
  const [inputs, setInputs] = useState({ A: 0, B: 100 });
  useEffect(() => {
    if (pedido) setInputs({ A: pedido.A, B: 100 - pedido.A });
  }, [pedido]);
  const handleChange = (e) => {
    const { value } = e.target;
    setInputs({ A: value, B: 100 - value });
  };
  const handleClose = (e) => {
    setInputs({ A: 0, B: 0 });
    onClose();
  };
  const handleGuardar = (e) => {
    pedido.A = parseFloat(inputs.A || 0);
    pedido.B = parseFloat(inputs.B || 0);
    onGuardar(pedido);
  };
  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto">
        <div className="formulario">
          <div className="formulario-item">
            <label htmlFor="A">A:</label>
            <input
              type="number"
              id="A"
              value={inputs.A}
              name="A"
              inputMode="decimal"
              min={0}
              step={0.1}
              onChange={handleChange}
            />
          </div>
          <div className="formulario-item">
            <label htmlFor="B">B:</label>
            <input
              id="B"
              name="B"
              type="number"
              value={inputs.B}
              inputMode="decimal"
              min={0}
              step={0.1}
            />
          </div>
        </div>
        <div className="formulario-botones">
          <button className="cancelar" onClick={handleClose}>
            Cerrar
          </button>
          <button className="confirmar" onClick={handleGuardar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalDetallePedido = ({ isOpen, onClose, data }) => {
  const [taras, setTaras] = useState(null);
  const [unidad, setUnidad] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [pesajes, setPesajes] = useState({
    Cantidad: unidad && unidad.Cantidad,
    PesoBruto: unidad && unidad.PesoBruto,
    Tara: unidad && unidad.Tara,
    PesoNeto: unidad && unidad.PesoBruto - unidad.Tara,
    PesoPieza: 0,
  });
  const handleClose = () => onClose();

  useEffect(() => {
    const getTaras = async () => {
      try {
        const auth = JSON.parse(sessionStorage.getItem("auth"));
        const result = await fetch(
          `${BASE_URL}iElemTaraSP/ElementosTaraDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
        );
        if (result.status !== 200) {
          throw new Error(result.text);
        }
        const json = await result.json();
        console.log(json);
        const jsonFiltered = data
          ? json.filter(({ Descripcion }) =>
              Descripcion.toLowerCase().includes(
                data[1]?.Decripcion.toLowerCase()
              )
            )
          : [];
        console.log(jsonFiltered);
        setTaras(jsonFiltered);
      } catch (err) {
        console.log(err);
      }
    };
    getTaras();
  }, [data]);

  useEffect(() => {
    data && setUnidad(data[0]);
    data && setTipo(data[1] ? data[1] : null);
  }, [data]);

  useEffect(() => {
    unidad &&
      setPesajes({
        Cantidad: unidad.Cantidad,
        PesoBruto: unidad.PesoBruto,
        Tara: unidad.Tara,
        PesoNeto: unidad.PesoBruto - unidad.Tara,
        PesoPieza: 0,
      });
  }, [unidad]);

  return (
    <div className={`overlay contenedor-peso ${isOpen ? "open" : ""}`}>
      {console.log(data, taras)}
      <div className="card-producto">
        <div className="form-tabla-peso">
          <div className="tittle-producto">
            <h2 className="tittle-peso">{data && data[0].Producto}</h2>
            <h3 className="subtittle-peso">Codigo: {data && data[0].Id}</h3>
          </div>
          <div className="form-inputs-peso">
            <div>
              <label htmlFor="piezas">Piezas Totales</label>
              <input
                disabled
                className="input-peso"
                name="piezas"
                value={pesajes.Cantidad ? pesajes.Cantidad : ""}
              />
            </div>
            <div>
              <label htmlFor="bruto">Peso Bruto</label>
              <input
                disabled
                className="input-peso"
                name="bruto"
                value={pesajes.PesoBruto ? pesajes.PesoBruto : ""}
              />
            </div>
            <div>
              <label htmlFor="tara">Tara</label>
              <input
                disabled
                className="input-peso"
                name="tara"
                value={pesajes.Tara ? pesajes.Tara : ""}
              />
            </div>
            <div>
              <label htmlFor="neto">Peso Neto</label>
              <input
                disabled
                className="input-peso"
                name="neto"
                value={pesajes.PesoNeto ? pesajes.PesoNeto : ""}
              />
            </div>
            <div>
              <label htmlFor="pesoPieza">Peso por Pieza</label>
              <input
                disabled
                className="input-peso"
                name="pesoPieza"
                value={
                  pesajes.PesoNeto
                    ? parseFloat(pesajes.PesoNeto / pesajes.Cantidad).toFixed(2)
                    : ""
                }
              />
            </div>
          </div>
          {taras?.length !== 0 ? (
            <div className="tara-table-peso">
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
                  {taras?.map((tara, index) => (
                    <tr key={index}>
                      <td>{tara.Descripcion}</td>
                      <td inputMode="decimal">
                        {tipo && tara.Descripcion === tipo.Decripcion
                          ? tipo.Cantidad
                          : null}
                      </td>
                      <td>
                        {tipo && tara.Descripcion === tipo.Decripcion
                          ? tipo.Peso
                          : tara.Peso}
                      </td>
                      <td>
                        {tipo && tara.Descripcion === tipo.Decripcion
                          ? parseFloat(tipo.Cantidad * tipo.Peso).toFixed(2)
                          : " "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        <button className="cancelar" onClick={handleClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Facturar;
