import { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../../BaseURL.json";

const calcularTara = (tara) => {
  let tarasTemp = tara;
  tarasTemp.TaraTotal = 0;
  tarasTemp.Taras.forEach((tara) => {
    tarasTemp.TaraTotal += tara.subTotal;
  });
  return tarasTemp;
};

const ModoPesar = ({ producto, onGuardar, onCancelar, prodData }) => {
  const [pesaje, setPesaje] = useState(
    prodData.EsPesoFijo
      ? {
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
          Taras: null,
          producto: producto,
        }
      : {
          TaraTotal: 0,
          PesoNeto: 0,
          PesoPorPieza: 0,
          PesoBruto: 0,
          Taras: null,
          producto: producto,
        }
  );

  const [editPiezas, setEditPiezas] = useState(false);
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
      setPesaje({ ...pesaje, Taras: tarasTemp });
    } catch (err) {
      console.log(err);
    }
  };

  const calcular = (taraTemp) => {
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
    }
    console.log(taraFinal);
    setPesaje(taraFinal);
  };

  /* Efectos */
  useEffect(() => {
    pedirTaras();
  }, []);

  return (
    <div className="contenedor-tabla">
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
            {console.log(pesaje)}
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
                  ></td>
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
