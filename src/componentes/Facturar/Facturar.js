import React, { useEffect, useState } from "react";
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
      }
    ) => {
      let prodTemp = {};
      const index = acum.findIndex((pedido) => pedido.Pedido === Pedido);

      if (index < 0) {
        prodTemp = {
          Pedido,
          Cliente,
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
const ProcesarPedidoParaGuardar = ({ Pedido, A, B, Productos }) => {
  const pedidoProcesado = {
    Numero: Pedido,
    Fecha: Date.now(),
    Productos: Productos.map(({ idPedidosPrepProd, CantidadLista, Peso }) => ({
      Cantidad: CantidadLista,
      idPedidosPrepProd,
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

const Facturar = ({ idPermiso, isConsulta }) => {
  const [isOpenModal, handleModal] = useModal();
  const [pedidosAFacturarFiltrados, setPedidosAFacturarFiltrados] = useState();
  const [pedidosAFacturar, setPedidosAFacturar] = useState();
  const [pedidoAjustar, setPedidoAjustar] = useState();
  const [isLoadPDF, setIsLoadPDF] = useState(false);
  const { push } = useHistory();

  const pedirPedidosParaFacturar = async () => {
    const auth = JSON.parse(localStorage.getItem("auth"));
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
          localStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      const json = await result.json();
      const PedidosAFacturarProcesados = ProcesarPedidosAFacturar(json);
      setPedidosAFacturar(PedidosAFacturarProcesados);
    } catch (err) {
      toast.error("ha ocurrido un error");
      console.log(err);
    }
  };

  /* Efectos */
  useEffect(() => {
    pedirPedidosParaFacturar();
  }, []);
  useEffect(() => {
    setPedidosAFacturarFiltrados(pedidosAFacturar);
  }, [pedidosAFacturar]);

  /* Manejadores de eventos */
  const handleChangeFiltro = (e) => {
    const resultado = filtrar(e.target.value, pedidosAFacturar);
    if (!resultado) return;
    setPedidosAFacturarFiltrados(resultado);
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
    const auth = JSON.parse(localStorage.getItem("auth"));
    const pedidoProcesado = ProcesarPedidoParaGuardar(
      pedidosAFacturarFiltrados[index]
    );
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/FacturarGuardar?pUsuario=${auth.usuario}&pToken=${auth.Token}`,
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

      toast.success("facturacion guardada correctamente");
      setPedidosAFacturar(null);
      pedirPedidosParaFacturar();
    } catch (err) {
      toast.error("ocurrio un error al guardar la factura.");
      console.log(err.message);
    }
  };
  const handleImprimir = (pedidoAImprimir) => async (e) => {
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    if (pedidoAImprimir === 0) return;
    setIsLoadPDF(true);
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/pedidoPesoImpresion?pUsuario=${usuario}&pToken=${Token}&pNumeroPedido=${pedidoAImprimir}`
      );
      const pdf = await result.json();
      const blobe = new Blob([pdf], { type: "data:application/pdf;base64" });
      //``
      const win = window.open();
      win.document.write(
        `<iframe src='data:application/pdf;base64,${pdf}' frameborder='0' style='border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;' allowfullscreen ></iframe>`
      );
    } catch (err) {
      toast.error("ocurrio un error. intentelo de nuevo mas tarde");
      console.log(err);
    } finally {
      setIsLoadPDF(false);
    }
  };

  return (
    <div className="contenedor-facturar">
      <ModalFactura
        isOpen={isOpenModal}
        onClose={handleModal}
        pedido={pedidoAjustar}
        onGuardar={handleGuardar}
      />
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />
          <span className="titulo">
            {isConsulta ? "Pesajes" : "Facturacion"}
          </span>
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
                {!isConsulta ? (
                  <span className="porcentajes">
                    A: {A}% - B: {B}%
                  </span>
                ) : null}
                {!isConsulta ? (
                  <div className="botones">
                    <button
                      onClick={handleAjustar(index)}
                      className="btn ajustar">
                      Ajustar
                    </button>
                    <button
                      onClick={handleGuardarPedido(index)}
                      disabled={!(A || B) || A + B !== 100}
                      className="btn">
                      Guardar
                    </button>
                  </div>
                ) : (
                  <div className="impresion">
                    <button
                      onClick={handleImprimir(Pedido)}
                      disabled={isLoadPDF}
                      className="btn">
                      Imprimir
                    </button>
                  </div>
                )}
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
                      { Codigo, Presentacion, CantidadLista, Medida, Peso },
                      indexProd
                    ) => (
                      <tr key={indexProd}>
                        <td>{Codigo}</td>
                        <td>
                          <div>
                            <span className="titulo">{Presentacion}</span>
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
  const [inputs, setInputs] = useState({ A: 0, B: 0 });
  useEffect(() => {
    if (pedido) setInputs({ A: pedido.A, B: pedido.B });
  }, [pedido]);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputs({ ...inputs, [name]: value });
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
              onChange={handleChange}
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

export default Facturar;
