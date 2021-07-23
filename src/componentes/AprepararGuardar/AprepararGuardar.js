import { useEffect, useState } from "react";
import ModoPreparar from "./ModoPreparar";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";
import "./AprepararGuardar.css";

const ProcesarPedido = (pedidos) => {
  let pedidosProcesados = [];
  if (Object.keys(pedidos).length === 0) return [];

  /*
    Agrupo el resumen y el detalle formando un objeto con los campos necesarios para armar 
    la tabla
  */
  pedidosProcesados = pedidos.Resumido.reduce((acum, actual) => {
    console.log(actual);
    let resultado = {
      ...actual,
      Fecha: new Date(actual.Fecha).toLocaleDateString(),
      Productos: [],
    };
    //recorro el detalle para obtener todos los productos de un pedido
    pedidos.Detallado.forEach(
      ({
        IdPedido,
        idPedidosProd,
        Codigo,
        Presentacion,
        Cantidad,
        Medida,
        IdMedidaPrinc,
        pesoMaximo,
        pesoMinimo,
      }) => {
        if (actual.IdPedido === IdPedido) {
          resultado.Productos.push({
            idPedidosProd,
            Codigo,
            Presentacion,
            Cantidad,
            IdMedidaPrinc,
            Medida,
            pesoMaximo,
            pesoMinimo,
            NuevoPedido: false,
            DesecharFaltante: false,
          });
        }
      }
    );
    return [...acum, resultado];
  }, []);
  return pedidosProcesados;
};

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
      IdMedidaPrinc,
      Cantidad,
      Pesaje,
      DesecharFaltante,
      NuevoPedido,
    }) => ({
      IdPreparado: 0,
      idPedidosProd,
      IdMedidaPrinc: IdMedidaPrinc || 1,
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
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [pedidoAImprimir, setPedidoAImprimir] = useState(0);
  const [modoPreparar, setModoPreparar] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadPDF, setIsLoadPDF] = useState(false);
  const { push } = useHistory();

  const pedirPedidosAPreparar = async () => {
    let pedidosProcesados = [];

    const { usuario, Token, permisos } =
      JSON.parse(localStorage.getItem("auth")) || {};
    if (!Token || !permisos.some(({ IdMenu }) => IdMenu === idPermiso))
      return push("/");

    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosParaPreparar?pUsuario=${usuario}&pToken=${Token}`
      );

      /* si la api devuelve un estado difetente a ok compruebo que el error no sea de auth */
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
    } finally {
      setIsLoading(false);
    }
  };

  /* Manejadores de Eventos  */
  const handleGuardarPreparacion = (pedido) => async (e) => {
    const pedidoProcesado = ProcesarParaGuardar(pedido);
    const auth = JSON.parse(localStorage.getItem("auth")) || {};
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
  const handleChangeImprimir = (e) => {
    const { value } = e.target;

    setPedidoAImprimir(parseInt(value));
  };
  const handleImprimir = async (e) => {
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    if (pedidoAImprimir === 0) return;
    setIsLoadPDF(true);
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/pedidoPesoImpresion?pUsuario=${usuario}&pToken=${Token}&pNumeroPedido=${pedidoAImprimir}`
      );
      const pdf = await result.json();
      const win = window.open(`data:application/pdf;base64,${pdf}`, "_blank");
      win.focus();
    } catch (err) {
      toast.error("ocurrio un error. intentelo de nuevo mas tarde");
      console.log(err);
    } finally {
      setIsLoadPDF(false);
    }
  };

  /* Efectos */
  useEffect(() => {
    setPedidosFiltrados(pedidos);
  }, [pedidos]);
  useEffect(() => {
    setIsLoading(true);
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
          <div className="impresion">
            {/* data:application/pdf;base64, */}
            <input
              style={{ width: "5em" }}
              type="number"
              onChange={handleChangeImprimir}
              value={pedidoAImprimir}
            />
            <button
              onClick={handleImprimir}
              disabled={isLoadPDF}
              className="botonPDF">
              Imprimir
            </button>
          </div>
        </div>
        <span className="titulo">Preparación</span>
        <hr />
      </div>
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
                  <button
                    hidden={isConsulta}
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

export default AprepararGuardar;
