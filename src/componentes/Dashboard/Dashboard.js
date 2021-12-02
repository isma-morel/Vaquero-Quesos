import React, { useEffect, useState } from "react";
import {
  SlideMenu,
  Pedidos,
  AprepararGuardar,
  Facturar,
  EstadoPedidos,
  CargaProductos,
  Permisos,
  Usuarios,
} from "../index";
import { Route, Switch, useHistory, Link } from "react-router-dom";
import "./Dashboard.css";
import Taras from "../Taras/Taras";
import { BASE_URL } from "../../BaseURL.json";
import { toast } from "react-toastify";

const Iconos = {
  Pedidos: <i className="fas fa-list-ul"></i>,
  Preparacion: <i className="fas fa-receipt"></i>,
  Confirmados: <i className="fas fa-check"></i>,
  Facturar: <i className="fas fa-file-invoice-dollar"></i>,
  Estado: <i className="fas fa-calendar-check"></i>,
  Taras: <i className="fas fa-balance-scale"></i>,
  Productos: <i className="fas fa-cheese"></i>,
  Permisos: <i className="fas fa-key"></i>,
  "Actualizar Clientes": <i className="fas fa-sync-alt"></i>,
  Usuarios: <i className="fas fa-user"></i>,
};

const Dashboard = () => {
  const { push } = useHistory();
  const [items, setItems] = useState([]);
  const traerPermisos = async (auth) => {
    try {
      const result = await fetch(
        `${BASE_URL}iMenusSP/Permisos?pUsuario=${auth.usuario}&pToken=${auth.Token}&pIdCliente=${auth.IdCliente}`
      );
      if (result.status !== 200) {
        toast.error("se produjo un error.");
        sessionStorage.removeItem("auth");
        push("/");
        return;
      }
      const json = await result.json();
      auth.permisos = json.filter((menu) => menu.Seleccionado);
      sessionStorage.setItem("auth", JSON.stringify(auth));
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
    const auth = JSON.parse(sessionStorage.getItem("auth"));

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
          <Facturar isConsulta={true} idPermiso={3} />
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
        <Route path="/Dashboard/actualizarClientes">
          <ActualizarClientes idPermiso={10} />
        </Route>
        <Route path="/Dashboard/usuarios">
          <Usuarios idPermiso={11} />
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

const ActualizarClientes = ({ idPermiso }) => {
  const { push } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const handleAceptar = async (e) => {
    const { usuario, Token, permisos } =
      JSON.parse(sessionStorage.getItem("auth")) || {};
    if (!Token || !permisos.some(({ IdMenu }) => IdMenu === idPermiso))
      return push("/");
    setIsLoading(true);
    try {
      await fetch(`${BASE_URL}Finnegans/procesarClientes`);
      toast.success("Clientes Actualizados con exito.");
      push("/Dashboard");
    } catch (err) {
      toast.error("Ocurrio un error, por favor intentelo de nuevo mas tarde.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }

    //Finnegans/procesarClientes
  };
  return (
    <div className="overlay open" style={{ background: "rgba(0,0,0,.5)" }}>
      <div
        style={{
          background: "#fff",
          position: "relative",
          width: "20em",
          borderRadius: ".2em",
          boxShadow: "0px 0px 25px rgba(0,0,0,.3) ",
          border: "1px solid rgba(0,0,0,.3)",
        }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            justifyContent: "space-between",
            alignContent: "space-between",
          }}>
          <div
            style={{
              textAlign: "center",
              padding: "1em",
              height: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <p style={{ userSelect: "none" }}>
              Seguro que desea actualizar los Clientes?
              <br />
              <small>(este proceso podria tomar algunos segundos.)</small>
            </p>
            {isLoading && (
              <div>
                <div
                  style={{
                    margin: ".3em auto",
                    width: "2em",
                    height: "2em",
                    border: "2px solid #fff",
                    borderTop: "2px solid #484848",
                  }}
                  className="spin"></div>
              </div>
            )}
          </div>
          <div style={{ padding: "1em", textAlign: "center" }}>
            <button
              style={{
                margin: "0px 0.35em",
                color: "white",
                background: "none",
                border: "none",
                borderRadius: ".2em",
                padding: "0.4em 0.6em",
                backgroundColor: "red",
              }}
              onClick={(e) => push("/Dashboard")}>
              Cancelar
            </button>
            <button
              style={{
                margin: "0px 0.35em",
                color: "white",
                background: "none",
                border: "none",
                borderRadius: ".2em",
                padding: "0.4em 0.6em",
                backgroundColor: "green",
              }}
              onClick={handleAceptar}>
              {" "}
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Iconos, Dashboard as default };
