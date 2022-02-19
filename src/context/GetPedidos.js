import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BASE_URL } from "../BaseURL.json";
import { useHistory } from "react-router";
import React from "react";
import { toast } from "react-toastify";
import audioMP3 from "./asset/notif.mp3";

const GetPedidos = createContext();

export const useGetPedidos = () => useContext(GetPedidos);

const ProcesarPedido = (pedidos) => {
  let pedidosProcesados = [];
  if (Object.keys(pedidos).length === 0) return [];

  /*
      Agrupo el resumen y el detalle formando un objeto con los campos necesarios para armar 
      la tabla
    */
  pedidosProcesados = pedidos.Resumido.reduce((acum, actual) => {
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
        idMedidaPrinc,
        pesoMaximo,
        pesoMinimo,
      }) => {
        if (actual.IdPedido === IdPedido) {
          resultado.Productos.push({
            idPedidosProd,
            Codigo,
            Presentacion,
            Cantidad,
            idMedidaPrinc,
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

export const GetPedidosProvider = ({ children }) => {
  const [pedidosPendientes, setPedidosPendientes] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [pedidosComparar, setPedidosComparar] = useState();
  const [comparacion, setComparacion] = useState(false);
  const { push } = useHistory();
  const audio = useRef();

  const pedirPedidosAPreparar = async () => {
    let pedidosProcesados = [];

    const { usuario, Token, permisos } =
      JSON.parse(sessionStorage.getItem("auth")) || {};
    if (permisos) {
      if (!Token || !permisos.some(({ IdMenu }) => IdMenu === 2)) return;

      try {
        const result = await fetch(
          `${BASE_URL}iPedidosSP/PedidosParaPreparar?pUsuario=${usuario}&pToken=${Token}`
        );

        /* si la api devuelve un estado difetente a ok compruebo que el error no sea de auth */
        if (result.status !== 200) {
          if (result.status === 401) {
            sessionStorage.removeItem("auth");
            push("/");
          }
          throw new Error(result.statusText);
        }

        const json = await result.json();

        pedidosProcesados = await ProcesarPedido(json);
        setPedidosPendientes(pedidosProcesados);
      } catch (err) {
        toast.error("a ocurrido un error");
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const pedirPedidosAPrepararComparar = async () => {
    const { usuario, Token, permisos } =
      JSON.parse(sessionStorage.getItem("auth")) || {};
    if (permisos) {
      if (!Token || !permisos.some(({ IdMenu }) => IdMenu === 2)) return;

      try {
        const result = await fetch(
          `${BASE_URL}iPedidosSP/PedidosParaPreparar?pUsuario=${usuario}&pToken=${Token}`
        );

        /* si la api devuelve un estado difetente a ok compruebo que el error no sea de auth */
        if (result.status !== 200) {
          if (result.status === 401) {
            sessionStorage.removeItem("auth");
            push("/");
          }
          throw new Error(result.statusText);
        }

        const json = await result.json();

        const pedidosProcesados = await ProcesarPedido(json);
        setPedidosComparar(pedidosProcesados);
      } catch (err) {
        toast.error("a ocurrido un error");
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => pedirPedidosAPrepararComparar(), 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    setIsLoading(true);
    pedirPedidosAPreparar();
  }, []);
  useEffect(() => {
    let timeout;
    if (pedidosComparar) {
      if (pedidosComparar.length > pedidosPendientes.length) {
        setPedidosPendientes(pedidosComparar);
        setComparacion(true);
        timeout = setTimeout(() => {
          setComparacion(false);
        }, 1000);
      } else {
        setPedidosPendientes(pedidosComparar);
        setComparacion(false);
      }
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [pedidosComparar, pedidosPendientes]);

  return (
    <GetPedidos.Provider
      value={{
        pedidosPendientes,
        isLoading,
        setPedidosPendientes: setPedidosPendientes,
        pedirPedidosAPreparar: pedirPedidosAPreparar,
      }}
    >
      {children}
      <audio
        playsInline={true}
        loop={true}
        autoPlay={true}
        muted={!comparacion}
        ref={audio}
        volume={1}
        src={audioMP3}
        type="audio/mp3"
      ></audio>
    </GetPedidos.Provider>
  );
};
