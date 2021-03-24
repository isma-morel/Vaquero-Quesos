import React, { useEffect } from "react";
import { SlideMenu, Pedidos } from "../index";
import { Route, Switch } from "react-router-dom";

const Dashboard = () => {
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
        ]}
      />
      <Switch>
        <Route path="/Dashboard/pedidos">
          <Pedidos />
        </Route>
        <Route path="/Dashboard/preparacion">
          <h1>otra cosa</h1>
        </Route>
      </Switch>
    </div>
  );
};

export default Dashboard;
