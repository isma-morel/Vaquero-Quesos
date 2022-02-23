import { useEffect, useState } from "react";
import ModoPreparar from "./ModoPreparar";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import useModal from "../../hooks/useModal";
import "./AprepararGuardar.css";
import { useLocation } from "react-router-dom";
import { useGetPedidos } from "../../context/GetPedidos";

/* Metodos de filtrado */
const FiltrarCliente = (cliente, pedidos) => {
  return pedidos.filter((pedido) =>
    pedido.Cliente.toLowerCase().includes(cliente.toLowerCase())
  );
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
/*  */

/* Proceso el pedido que voy a guardar para enviarlo a la api */
const ProcesarParaGuardar = (pedido) => {
  let PedidoProcesado = {};

  PedidoProcesado.Numero = pedido.Pedido;
  PedidoProcesado.Fecha = new Date(Date.now()).toISOString();
  PedidoProcesado.IdCliente = pedido.IdCliente;
  PedidoProcesado.IdPedido = pedido.IdPedido;

  PedidoProcesado.Productos = pedido.Productos.map(
    ({
      idPedidosProd,
      idMedidaPrinc,
      Cantidad,
      Pesaje,
      DesecharFaltante,
      NuevoPedido,
    }) => ({
      IdPreparado: 0,
      idPedidosProd,
      idMedidaPrinc,
      Cantidad,
      PesoBruto: Pesaje?.PesoBruto || 0,
      DesecharFaltante,
      NuevoPedido,
      Tara:
        Pesaje?.Taras?.map(({ IdElemTara, cantidad, Peso }) => ({
          IdPreparado: 0,
          idPedidosProd,
          IdElemTara,
          Cantidad: cantidad,
          Peso,
        })) || [],
    })
  );
  return PedidoProcesado;
};

function AprepararGuardar({ isConsulta, idPermiso }) {
  /* Variables de estado */
  const {
    setIsLoading,
    pedidosPendientes,
    isLoading,
    setPedidosPendientes,
    pedirPedidosAPreparar,
  } = useGetPedidos();
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [modoPreparar, setModoPreparar] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState({});
  const [pedidoAeliminar, setPedidoAeliminar] = useState({});
  const [isLoadPDF, setIsLoadPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState({ url: "", pedido: 0 });
  const [isOpenModalImpresion, handleModalImpresion] = useModal();
  const [isOpenModalBorrar, handleModalBorrar] = useModal();
  const { push } = useHistory();

  const volverAlListado = () => {
    setModoPreparar(false);
    setPedidoSeleccionado({});
    pedirPedidosAPreparar();
  };

  const imprimirPesaje = async (pedido, usuario, Token) => {
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/pedidoPesoImpresion?pUsuario=${usuario}&pToken=${Token}&pNumeroPedido=${pedido}`
      );

      const pdf = await result.json();

      setPdfUrl({ url: `data:application/pdf;base64,${pdf}`, pedido });
      handleModalImpresion();
    } catch (err) {}
  };
  /* Manejadores de Eventos  */
  const handleGuardarPreparacion = (pedido) => async (e) => {
    const pedidoProcesado = ProcesarParaGuardar(pedido);
    const auth = JSON.parse(sessionStorage.getItem("auth")) || {};
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PrepararGuardar?pUsuario=${auth.usuario}&pToken=${auth.Token}&pIdClienteRegistro=${auth.IdCliente}`,
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
          sessionStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      toast.success("Pedido guardado con exito");
      await imprimirPesaje(pedidoProcesado.Numero, auth.usuario, auth.Token);
      volverAlListado();
    } catch (err) {
      toast.error("se ha producido un error");
      console.log(err);
    }
  };

  const handlePreparar = (producto) => (e) => {
    setPedidoSeleccionado(producto);
    setModoPreparar(true);
  };

  const handlePrepararCerrar = (e) => {
    setPedidosPendientes([]);
    pedirPedidosAPreparar();
    setPedidoSeleccionado({});
    setModoPreparar(false);
  };

  const handleChangeFiltro = (e) => {
    const resultado = Filtrar(e.target.value, pedidosPendientes);
    if (!resultado) return;
    setPedidosFiltrados(resultado);
  };

  const handleEliminar = (e, pedido) => {
    console.log(e.target);
    setPedidoAeliminar(pedido);
    handleModalBorrar();
  };

  const handleEliminarCerrar = () => {
    pedirPedidosAPreparar();
  };

  /* Efectos */
  useEffect(() => {
    setPedidosFiltrados(pedidosPendientes);
  }, [pedidosPendientes]);

  return (
    <div className="preparar">
      <ModalImpresion
        isOpen={isOpenModalImpresion}
        onClose={handleModalImpresion}
        pdfUrl={pdfUrl}
      />
      <ModalEliminar
        isOpen={isOpenModalBorrar}
        onClose={handleModalBorrar}
        pedido={pedidoAeliminar}
        cerrar={handleEliminarCerrar}
      />
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />
        </div>
        <span className="titulo">Preparación</span>
        <span className="subtitulo">
          Pedidos Pendientes: {pedidosPendientes && pedidosPendientes.length}
        </span>
        <hr />
      </div>
      <div className="contenedorPedidos">
        {console.log(pedidosFiltrados)}
        {!isLoading ? (
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
                    <div>
                      <button
                        onClick={(e) =>
                          handleEliminar(e, pedidosFiltrados[index])
                        }
                        className="btn btn-cancelar"
                      >
                        Eliminar
                      </button>
                      <button
                        hidden={isConsulta}
                        onClick={handlePreparar(pedidosFiltrados[index])}
                        className="btn"
                      >
                        Preparar
                      </button>
                    </div>
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
    </div>
  );
}

const ModalImpresion = ({ isOpen, onClose, pdfUrl }) => {
  const handleClose = (e) => {
    onClose();
  };
  const handleGuardar = (e) => {
    const a = document.createElement("a");
    a.href = pdfUrl.url;
    a.download = `pedido-N${
      pdfUrl.pedido
    }-${new Date().toLocaleDateString()}.pdf`;
    a.click();
    onClose();
  };
  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto impresion">
        <embed
          id="embed"
          style={{
            height: "100%",
            width: "100%",
            border: 0,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          src={`${pdfUrl?.url}`}
          type="application/pdf"
        />
        <div className="formulario-botones impresion">
          <button className="cancelar" onClick={handleClose}>
            Cerrar
          </button>
          <button className="confirmar" onClick={handleGuardar}>
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
};
const ModalEliminar = ({ isOpen, onClose, pedido, cerrar }) => {
  const { setIsLoading, pedirPedidosAPreparar } = useGetPedidos();
  const { push } = useHistory();
  const handleClose = (e) => {
    onClose();
  };
  const handleEliminar = async (pedidoEliminar) => {
    const auth = JSON.parse(sessionStorage.getItem("auth")) || {};
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/Eliminar?pUsuario=${auth.usuario}&pToken=${auth.Token}&pPedido=${pedidoEliminar.IdPedido}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedido),
        }
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          sessionStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }
      toast.success("Pedido eliminado con exito");
      console.log(result);
      onClose();
    } catch (err) {
      toast.error("se ha producido un error");
      console.log(err);
      onClose();
    } finally {
      setIsLoading(true);
      pedirPedidosAPreparar();
    }
  };

  return (
    <div className={`overlay ${isOpen ? "open" : ""}`}>
      <div className="card-producto opcion">
        <h2>¿Estas seguro de eliminar el pedido?</h2>
        <div className="formulario-botones impresion">
          <button className="cancelar" onClick={handleClose}>
            Cancelar
          </button>
          <button className="confirmar" onClick={() => handleEliminar(pedido)}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AprepararGuardar;
