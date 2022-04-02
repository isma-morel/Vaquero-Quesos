import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { BASE_URL } from "../../BaseURL.json";

const calcularTara = (tara) => {
  let tarasTemp = tara;
  tarasTemp.TaraTotal = 0;
  tarasTemp.Taras.forEach((tara) => {
    tarasTemp.TaraTotal += tara.subTotal;
  });
  return tarasTemp;
};

const ModoPesar = ({
  producto,
  onGuardar,
  onCancelar,
  pedirData,
  pesajeProvisorio,
}) => {
  const [prodData, setProdData] = useState({});
  const [pesaje, setPesaje] = useState({
    TaraTotal: 0,
    PesoNeto: 0,
    PesoPorPieza: 0,
    PesoBruto: 0,
    Taras: null,
    producto: producto,
  });
  const [taras, setTaras] = useState([]);

  const [editPiezas, setEditPiezas] = useState(false);
  const { push } = useHistory();
  /* Manejadores de eventos */
  const handleChangeBruto = (e) => {
    const onlyNumber = /([A-Z])/gi;
    const onlyComa = /,/gi;
    let { value } = e.target;
    let valueReplace = value.trim().replace(onlyNumber, "");
    let valueReplaceComa = valueReplace.trim().replace(onlyComa, ".");
    e.target.value = valueReplaceComa;
    calcular({ ...pesaje, PesoBruto: parseFloat(valueReplaceComa) });
  };

  const handlePiezasClick = (e) => {
    if (!pesaje.producto.Cantidad) return;
    setEditPiezas(!editPiezas);
  };

  const handleChangePiezas = (e) => {
    const onlyNumber = /([A-Z])/gi;
    const onlyComa = /,/gi;

    const { value } = e.target;
    let valueReplace = value.trim().replace(onlyNumber, "");
    let valueReplaceComa = valueReplace.trim().replace(onlyComa, ".");
    e.target.value = valueReplaceComa;
    let tempProd = pesaje.producto;
    tempProd.Cantidad = parseFloat(value);
    calcular({ ...pesaje, producto: tempProd });
  };

  const handleChangePeso = (indice) => (e) => {
    const esNumero = /^[0-9]+([.])?([0-9]+)?$/;
    let taraTemp = pesaje.Taras;
    if (!e.target.innerText.trim().match(esNumero)) {
      e.target.innerHTML = "<br/>";
      taraTemp[indice].Peso = 0;
      taraTemp[indice].subTotal = 0;
      calcular({ ...pesaje, Taras: taraTemp });
      return;
    }
    taraTemp[indice].subTotal =
      parseFloat(e.target.innerText) * parseFloat(taraTemp[indice].cantidad);
    taraTemp[indice].Peso = parseFloat(e.target.innerText);

    calcular({
      ...pesaje,
      Taras: taraTemp,
    });
  };

  const handleChange = (indice) => (e) => {
    const esNumero = /^[0-9]+([.])?([0-9]+)?$/;
    let taraTemp = pesaje.Taras;

    if (!e.target.innerText.trim().match(esNumero)) {
      e.target.innerHTML = "</br>";
      taraTemp[indice].subTotal = 0;
      taraTemp[indice].cantidad = 0;
      calcular({ ...pesaje, Taras: taraTemp });
      return;
    }
    taraTemp[indice].subTotal =
      parseFloat(e.target.innerText) * parseFloat(taraTemp[indice].Peso);
    taraTemp[indice].cantidad = parseFloat(e.target.innerText);

    calcular({
      ...pesaje,
      Taras: taraTemp,
    });
  };

  /* funciones  */
  const pedirTaras = async () => {
    const user = JSON.parse(sessionStorage.getItem("auth")) || {};
    let tarasTemp = [];
    try {
      const result = await fetch(
        `${BASE_URL}iElemTaraSP/ElementosTaraDatos?pUsuario=${user.usuario}&pToken=${user.Token}`
      );
      if (result.status !== 200) {
        throw new Error(result.text);
      }
      const json = await result.json();
      json.forEach((tara) =>
        tarasTemp.push({
          ...tara,
          subTotal: 0,
          cantidad: 0,
          PesoEditable: !tara.Peso,
        })
      );
      setTaras(tarasTemp);
    } catch (err) {
      console.log(err);
    }
  };

  const calcular = (taraTemp) => {
    console.log(taraTemp);
    let taraFinal = calcularTara(taraTemp);
    if (prodData.EsPesoFijo) {
      taraFinal.TaraTotal !== 0
        ? (taraFinal.PesoBruto = parseFloat(
            taraFinal.producto.Cantidad * prodData.PesoPromedio +
              taraFinal.TaraTotal
          ).toFixed(2))
        : (taraFinal.PesoBruto = parseFloat(
            taraFinal.producto.Cantidad * prodData.PesoPromedio
          ).toFixed(2));
      taraFinal.PesoNeto = parseFloat(
        taraFinal.PesoBruto - taraFinal.TaraTotal
      ).toFixed(2);
      taraFinal.PesoPorPieza = parseFloat(
        taraFinal.PesoNeto / taraTemp.producto.Cantidad
      ).toFixed(2);
      setPesaje(taraFinal);
      return;
    }
    if (taraFinal.PesoBruto !== 0) {
      taraFinal.PesoNeto = parseFloat(
        taraFinal.PesoBruto - taraFinal.TaraTotal
      ).toFixed(2);
      taraFinal.PesoPorPieza = parseFloat(
        taraFinal.PesoNeto / taraTemp.producto.Cantidad
      ).toFixed(2);
      console.log(taraFinal);
      setPesaje(taraFinal);
      return;
    }
  };

  /* Efectos */
  useEffect(() => {
    pedirTaras();
  }, []);

  useEffect(() => {
    const obtenerPedidos = async (prod) => {
      try {
        const auth = JSON.parse(sessionStorage.getItem("auth"));
        const result = await fetch(
          `${BASE_URL}iProductosSP/ProductosDatos?pUsuario=${auth.usuario}&pToken=${auth.Token}`
        );

        if (result.status !== 200) {
          if (result.status === 401) return push("/");
          throw new Error("error al obtener los pedidos");
        }

        const json = await result.json();
        setProdData(() => json.find(({ Codigo }) => prod.Codigo === Codigo));
      } catch (err) {
        console.log(err);
        toast.error(err);
      }
    };
    obtenerPedidos(producto);
  }, []);

  useEffect(() => {
    if (pesajeProvisorio) {
      const tarasProvisorio = taras.map((itemTara) => {
        const elemProvisorio = pesajeProvisorio.Tara.find(
          ({ IdElemTara }) => IdElemTara === itemTara.IdElemTara
        );
        itemTara.cantidad = elemProvisorio.Cantidad;
        itemTara.Peso = elemProvisorio.Peso;
        itemTara.subTotal = elemProvisorio.Cantidad * elemProvisorio.Peso;
        return itemTara;
      });
      console.log(tarasProvisorio);
      if (prodData.EsPesoFijo) {
        producto.Cantidad = pesajeProvisorio.Cantidad;
        const pesajesProvisoriosFijos = {
          TaraTotal: 0,
          PesoNeto: parseFloat(
            pesajeProvisorio.Cantidad * prodData.PesoPromedio
          ).toFixed(2),
          PesoPorPieza: parseFloat(
            pesajeProvisorio.Cantidad * prodData.PesoPromedio
          ).toFixed(2),
          PesoBruto: pesajeProvisorio.PesoBruto,
          Taras: tarasProvisorio,
          producto: producto,
        };
        const taraFinal = calcularTara(pesajesProvisoriosFijos);

        taraFinal.TaraTotal !== 0
          ? (taraFinal.PesoBruto = parseFloat(
              taraFinal.producto.Cantidad * prodData.PesoPromedio +
                taraFinal.TaraTotal
            ).toFixed(2))
          : (taraFinal.PesoBruto = parseFloat(
              taraFinal.producto.Cantidad * prodData.PesoPromedio
            ).toFixed(2));
        taraFinal.PesoNeto = parseFloat(
          taraFinal.PesoBruto - taraFinal.TaraTotal
        ).toFixed(2);
        taraFinal.PesoPorPieza = parseFloat(
          taraFinal.PesoNeto / pesajesProvisoriosFijos.producto.Cantidad
        ).toFixed(2);
        setPesaje(taraFinal);
      } else {
        producto.Cantidad = pesajeProvisorio.Cantidad;
        const pesajesProvisoriosFijos = {
          TaraTotal: 0,
          PesoNeto: 0,
          PesoPorPieza: 0,
          PesoBruto: pesajeProvisorio.PesoBruto,
          Taras: tarasProvisorio,
          producto: producto,
        };
        const taraFinal = calcularTara(pesajesProvisoriosFijos);
        if (taraFinal.PesoBruto !== 0) {
          taraFinal.PesoNeto = parseFloat(
            taraFinal.PesoBruto - taraFinal.TaraTotal
          ).toFixed(2);
          taraFinal.PesoPorPieza = parseFloat(
            taraFinal.PesoNeto / pesajesProvisoriosFijos.producto.Cantidad
          ).toFixed(2);
          console.log(taraFinal);
          setPesaje(taraFinal);
          return;
        }
      }
    } else {
      if (prodData.EsPesoFijo) {
        setPesaje({
          TaraTotal: 0,
          PesoNeto: parseFloat(
            producto.Cantidad * prodData.PesoPromedio
          ).toFixed(2),
          PesoPorPieza: parseFloat(
            producto.Cantidad * prodData.PesoPromedio
          ).toFixed(2),
          PesoBruto: parseFloat(
            producto.Cantidad * prodData.PesoPromedio
          ).toFixed(2),
          Taras: taras,
          producto: producto,
        });
      } else {
        setPesaje({
          TaraTotal: 0,
          PesoNeto: 0,
          PesoPorPieza: 0,
          PesoBruto: 0,
          Taras: taras,
          producto: producto,
        });
      }
    }
  }, [prodData, taras]);

  return (
    <div className="contenedor-tabla">
      {console.log(pesajeProvisorio, taras)}
      <div className="contenedor-cliente">
        <div className="datos">
          <span>Codigo: {pesaje.producto.Codigo}</span>
          <span>Presentacion: {pesaje.producto.Presentacion}</span>
        </div>
      </div>
      <div className="form-tabla">
        <div className="form-pesaje">
          <div className="flex-input piezas-input">
            <label htmlFor="piezas">Piezas Totales</label>
            <div className="piezas-input-boton">
              <input
                formnovalidate
                min={0}
                type="text"
                name="piezas"
                id="piezas"
                disabled={!editPiezas}
                value={
                  isNaN(pesaje.producto.Cantidad)
                    ? " "
                    : pesaje.producto.Cantidad
                }
                onChange={handleChangePiezas}
              />
              <button onClick={handlePiezasClick}>
                {!editPiezas ? "Cambiar" : "Cambiando"}
              </button>
            </div>
          </div>
          <div className="flex-input bruto-input">
            <label htmlFor="bruto">Peso Bruto</label>
            <input
              formnovalidate
              type="text"
              name="bruto"
              id="bruto"
              step={0.5}
              inputMode="decimal"
              onChange={handleChangeBruto}
              disabled={prodData.EsPesoFijo ? true : false}
              value={prodData.EsPesoFijo ? pesaje.PesoBruto : null}
              placeholder={
                pesajeProvisorio
                  ? "Provisorio: " + pesajeProvisorio.PesoBruto
                  : null
              }
              // value={JSON.parse(pesaje.PesoBruto)}
            />
          </div>
          <div className="flex-input ">
            <div className="tara-input">
              <label htmlFor="tara">Tara</label>
              <input
                formnovalidate
                type="text"
                name="tara"
                id="tara"
                disabled
                value={
                  isNaN(pesaje.TaraTotal)
                    ? " "
                    : parseFloat(pesaje.TaraTotal).toFixed(2)
                }
              />
            </div>
          </div>
          <div className="flex-input neto-input">
            <label htmlFor="neto">Peso Neto</label>
            <input
              formnovalidate
              disabled
              type="text"
              name="neto"
              id="neto"
              value={isNaN(pesaje.PesoNeto) ? " " : pesaje.PesoNeto}
            />
          </div>
          <div className="flex-input pesoPieza-input">
            <label htmlFor="pesoPieza">Peso por Pieza</label>
            <input
              formnovalidate
              disabled
              type="text"
              name="pesoPieza"
              id="pesoPieza"
              className={`${
                pesaje.PesoPorPieza > 0 &&
                (pesaje.PesoPorPieza < producto.pesoMinimo ||
                  pesaje.PesoPorPieza > producto.pesoMaximo)
                  ? "pesoRojo"
                  : ""
              }`}
              value={isNaN(pesaje.PesoPorPieza) ? " " : pesaje.PesoPorPieza}
            />
          </div>
          <div className="botones-form">
            <button onClick={onCancelar} className="boton-form boton-cancelar">
              Cancelar
            </button>
            <button
              disabled={!(pesaje.PesoPorPieza > 0)}
              onClick={onGuardar(pesaje)}
              className="boton-form"
            >
              Guardar
            </button>
          </div>
        </div>
        <div className="tara-table">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Peso</th>
                <th>SubTotal</th>
              </tr>
            </thead>
            <tbody>
              {pesaje.Taras?.map((tara, index) => (
                <tr key={index}>
                  <td>{tara.Descripcion}</td>
                  <td
                    contentEditable
                    inputMode="decimal"
                    onSelect={handleChange(index)}
                  >
                    {tara.cantidad}
                  </td>
                  {tara.EditaPeso ? (
                    <td
                      contentEditable
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        e.target.innerHTML === "<br>"
                          ? (e.target.innerHTML = "0")
                          : null
                      }
                      onSelect={handleChangePeso(index)}
                    >
                      0
                    </td>
                  ) : (
                    <td>{tara.Peso}</td>
                  )}
                  <td>{parseFloat(tara.subTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModoPesar;
