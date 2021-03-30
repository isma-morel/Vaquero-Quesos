import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../BaseURL.json";
import "./AprepararGuardar.css";
function AprepararGuardar() {
  const [pedidos, setPedidos] = useState({});

  const pedirPedidosAPreparar = async () => {
    const { usuario, Token } = JSON.parse(localStorage.getItem("auth")) || {};
    if (!Token) return;
    try {
      const result = await fetch(
        `${BASE_URL}iPedidosSP/PedidosParaPreparar?pUsuario=${usuario}&pToken=${Token}`
      );
      if (result.status !== 200) throw new Error(result.statusText);

      const json = await result.json();
      if (!json?.Resumido) throw new Error("error al obtener los datos");
      console.log(json);

      setPedidos({ ...json });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    pedirPedidosAPreparar();
  }, []);

  return (
    <div className="contenedor contenedor-preparar">
      <h1>Work in Progress</h1>
    </div>
  );
}

export default AprepararGuardar;
