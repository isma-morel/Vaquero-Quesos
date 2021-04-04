import React, { useEffect } from "react";
import { SlideMenu, Pedidos, AprepararGuardar, Facturar } from "../index";
import { Route, Switch, useHistory } from "react-router-dom";

const Dashboard = () => {
  const { push } = useHistory();
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth) {
      push("/");
    }
    if (auth.TipoCliente === "C") {
      push("/Lista");
      return;
    }
  }, []);
  return (
    <div className="contenedor">
      <SlideMenu
        Items={[
          {
            to: "/Dashboard/pedidos",
            icono: <i className="fas fa-list-ul"></i>,
            texto: "Pedidos",
          },
          {
            to: "/Dashboard/preparacion",
            icono: <i className="fas fa-receipt"></i>,
            texto: "Preparacion",
          },
          {
            to: "/Dashboard/facturar",
            icono: <i className="fas fa-file-invoice-dollar"></i>,
            texto: "Facturar",
          },
          {
            to: "/Logout",
            icono: <i className="fas fa-sign-out-alt"></i>,
            texto: "salir",
          },
        ]}
      />
      <Switch>
        <Route path="/Dashboard/pedidos">
          <Pedidos />
        </Route>
        <Route path="/Dashboard/preparacion">
          <AprepararGuardar />
        </Route>
        <Route path="/Dashboard/facturar">
          <Facturar />
        </Route>
      </Switch>
    </div>
  );
};

export default Dashboard;
