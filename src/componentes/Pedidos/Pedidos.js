import React, { useEffect, useState } from "react";
import "./Pedidos.css";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../../BaseURL.json";

/* Procesamiento del pedio para poder armar las tablas,
  recibe los datos crudos y devuelve los datos con la estructura necesaria.
*/
const ProcesarPedido = (pedidos) => {
  if (pedidos.length === 0) return [];
  const pedido = pedidos.reduce(
    (
      acum,
      {
        IdPedido,
        Pedido,
        Cliente,
        IdProducto,
        Codigo,
        Presentacion,
        Cantidad,
        CantidadPreparar,
        idPedidosProd,
        Medida,
        IdMedidaPrinc,
        MedidaPrinc,
      }
    ) => {
      let indexPedido = acum.findIndex((elem) => elem.IdPedido === IdPedido);
      if (indexPedido < 0) {
        return [
          ...acum,
          {
            IdPedido,
            Pedido,
            Cliente,
            Productos: [
              {
                IdProducto,
                Codigo,
                Presentacion,
                Cantidad,
                CantidadPreparar,
                idPedidosProd,
                Medida,
                IdMedidaPrinc,
                MedidaPrinc,
              },
            ],
          },
        ];
      }
      acum[indexPedido].Productos.push({
        IdProducto,
        Codigo,
        Presentacion,
        Cantidad,
        CantidadPreparar,
        idPedidosProd,
        Medida,
        IdMedidaPrinc,
        MedidaPrinc,
      });
      return [...acum];
    },
    []
  );
  return pedido;
};

const filtrarPedidoPorId = (id, pedidos) => {
  return pedidos.filter((pedido) => pedido.Pedido.toString().startsWith(id));
};

const filtrarPedidoPorCliente = (cliente, pedidos) => {
  return pedidos.filter((pedido) => pedido.Cliente.includes(cliente));
};

/* Metodo que se encarga de discernir entre el tipo de filtrado que se va a aplicar
  si es un numero aplica el filtro por Id y si es un string aplica un filtro por Cliente.
*/
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

/* funcion encargada de obtener todos los pedidos que hayan sido cargados
    recibe el arreglo de pedidos y devuelve todos aquellos pedios que ya esten preparados
    para la confirmacion.
*/
const ProcesarPedidoAConfirmar = ({ Productos }) => {
  let Preparados = [];

  Productos.map(({ CantidadPreparar, idPedidosProd, IdMedidaPrinc }) => {
    if (CantidadPreparar > 0) {
      Preparados.push({
        idPedidosProd,
        IdMedidaPrinc,
        CantidadPrinc: CantidadPreparar,
      });
    }
  });

  return Preparados;
};

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useHistory();

  const PedirPedidos = async () => {
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    if (!Token) return;

    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosPendientes?pUsuario=${usuario}&pToken=${Token}`
      );
      setIsLoading(false);
      if (result.status !== 200) {
        if (result.status === 401) {
          localStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }

      const json = await result.json();

      const pedidoProcesado = await ProcesarPedido(json);

      setPedidos(pedidoProcesado);
    } catch (err) {
      toast.error("ha ocurrido un error");
      console.log(err.message);
    }
  };

  const handleConfirmar = (index) => async (e) => {
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    let Preparados = ProcesarPedidoAConfirmar(pedidos[index]);
    if (Preparados.length === 0) return;
    let PedidosPreparados = { PedidosAPrepararTodos: Preparados };
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/APrepararGuardar?pUsuario=${usuario}&pToken=${Token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(PedidosPreparados),
        }
      );
      if (result.status !== 200) {
        if (result.status === 401) {
          localStorage.removeItem("auth");
          push("/");
        }
        throw new Error(result.statusText);
      }
      setPedidos([]);
      PedirPedidos();
      toast.success(`pedido N° ${pedidos[index].Pedido} confirmado con exito`);
    } catch (err) {
      toast.error("ha ocurrido un error.");
      console.log(err);
    }
  };

  const handleChangeFiltro = (e) => {
    const resultado = filtrar(e.target.value, pedidos);
    if (!resultado) return;
    setPedidosFiltrados(resultado);
  };

  const handleChangeCantidad = (index, indexProd) => (e) => {
    const { target } = e;
    let pedidosTemp = pedidosFiltrados;

    pedidosTemp[index].Productos[indexProd].CantidadPreparar =
      parseInt(target.value) || "";

    setPedidosFiltrados([...pedidosTemp]);
  };

  /* Efecto encargado de actualizar la lista de pedidos que se va a renderizar */
  useEffect(() => {
    setPedidosFiltrados(pedidos);
  }, [pedidos]);
  /* Efecto encargado de realizar la peticion de la lista  */
  useEffect(() => {
    setIsLoading(true);
    PedirPedidos();
  }, []);

  return (
    <div className="pedidos">
      <div className="controles">
        <div>
          <input
            type="text"
            name="filtro"
            placeholder="Filtro"
            onChange={handleChangeFiltro}
          />
        </div>
        <span className="titulo">Pedidos</span>
        <hr />
      </div>

      {!isLoading ? (
        pedidosFiltrados.map(({ Cliente, Pedido, Productos }, index) => (
          <div key={index} className="contenedor-tabla">
            <div className="contenedor-cliente">
              <span>
                Cliente: {Cliente} - Pedido: {Pedido}
              </span>
              <button className="btn" onClick={handleConfirmar(index)}>
                Confirmar pedido
              </button>
            </div>
            <table className="tabla tabla-pedidos">
              <thead>
                <tr>
                  <th>CODIGO</th>
                  <th>PRESENTACIÓN</th>
                  <th>CANTIDAD PEDIDA</th>
                  <th>CANTIDAD A PREPARAR</th>
                </tr>
              </thead>
              <tbody>
                {Productos?.map(
                  (
                    {
                      Codigo,
                      Presentacion,
                      Cantidad,
                      Medida,
                      CantidadPreparar,
                      MedidaPrinc,
                    },
                    indexProd
                  ) => (
                    <tr key={indexProd}>
                      <td>{Codigo}</td>
                      <td>
                        <div>
                          <span className="titulo">{Presentacion}</span>
                        </div>
                      </td>
                      <td>{`${Cantidad} ${Medida || ""}`}</td>
                      <td className="cantidad-preparar">
                        <input
                          value={CantidadPreparar}
                          type="number"
                          min={0}
                          onChange={handleChangeCantidad(index, indexProd)}
                        />
                        {MedidaPrinc}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <hr />
          </div>
        ))
      ) : (
        <div className="spin"></div>
      )}
    </div>
  );
};

export default Pedidos;
