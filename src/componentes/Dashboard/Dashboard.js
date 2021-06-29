import React, { useEffect, useState } from "react";
import {
  SlideMenu,
  Pedidos,
  AprepararGuardar,
  Facturar,
  EstadoPedidos,
  CargaProductos,
  Permisos,
} from "../index";
import { Route, Switch, useHistory, Link } from "react-router-dom";
import "./Dashboard.css";
import Taras from "../Taras/Taras";
import { BASE_URL } from "../../BaseURL.json";
import { toast } from "react-toastify";
const Dashboard = () => {
  const { push } = useHistory();
  const [items, setItems] = useState([]);
  const Iconos = {
    Pedidos: <i className="fas fa-list-ul"></i>,
    Preparacion: <i className="fas fa-receipt"></i>,
    Confirmados: <i className="fas fa-check"></i>,
    Facturar: <i className="fas fa-file-invoice-dollar"></i>,
    Estado: <i className="fas fa-calendar-check"></i>,
    Taras: <i className="fas fa-balance-scale"></i>,
    Productos: <i className="fas fa-cheese"></i>,
    Permisos: <i className="fas fa-key"></i>,
  };
  const traerPermisos = async (auth) => {
    try {
      const result = await fetch(
        `${BASE_URL}iMenusSP/Permisos?pUsuario=${auth.usuario}&pToken=${auth.Token}&pIdCliente=${auth.IdCliente}`
      );
      if (result.status !== 200) {
        toast.error("se produjo un error.");
        push("/");
        return;
      }
      const json = await result.json();
      auth.permisos = json.filter((menu) => menu.Seleccionado);
      localStorage.setItem("auth", JSON.stringify(auth));
      setItems([
        ...auth.permisos.map(({ NombrePantalla, Titulo }) => ({
          to: "/Dashboard/" + NombrePantalla,
          icono: Iconos[Titulo],
          texto: Titulo,
        })),
        {
          to: "/Logout",
          icono: <i className="fas fa-sign-out-alt"></i>,
          texto: "salir",
        },
      ]);
    } catch (err) {}
  };
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (auth?.TipoCliente !== "S") {
      push("/");
      return;
    }
    traerPermisos(auth);
  }, []);
  return (
    <div className="contenedor">
      <SlideMenu Items={items} />
      <Switch>
        <Route path="/Dashboard/pedidos">
          <Pedidos idPermiso={1} />
        </Route>
        <Route path="/Dashboard/preparacion">
          <AprepararGuardar idPermiso={2} />
        </Route>
        <Route path="/Dashboard/consultaPreparados">
          <AprepararGuardar isConsulta={true} idPermiso={3} />
        </Route>
        <Route path="/Dashboard/facturar">
          <Facturar idPermiso={4} />
        </Route>
        <Route path="/Dashboard/estado">
          <EstadoPedidos idPermiso={5} />
        </Route>
        <Route path="/Dashboard/taras">
          <Taras idPermiso={6} />
        </Route>
        <Route path="/Dashboard/productos">
          <CargaProductos idPermiso={7} />
        </Route>
        <Route path="/Dashboard/permisos">
          <Permisos idPermiso={8} />
        </Route>

        <Route path="/Dashboard">
          <div className="dashboard">
            <div className="grid">
              {items.map((item, index) => (
                <Link key={index} title={item.texto} to={item.to}>
                  {item.icono}
                </Link>
              ))}
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
};

export default Dashboard;
