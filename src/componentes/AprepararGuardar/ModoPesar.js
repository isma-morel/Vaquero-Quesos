import { useState, useEffect } from "react";
import { BASE_URL } from "../../BaseURL.json";

const calcularTara = (tara) => {
  let tarasTemp = tara;
  tarasTemp.TaraTotal = 0;
  tarasTemp.Taras.forEach((tara) => {
    tarasTemp.TaraTotal += tara.subTotal;
  });
  return tarasTemp;
};

const ModoPesar = ({ producto, onGuardar, onCancelar }) => {
  const [pesaje, setPesaje] = useState({
    TaraTotal: 0,
    PesoNeto: 0,
    PesoPorPieza: 0,
    PesoBruto: 0,
    Taras: null,
    producto: producto,
  });

  const [editPiezas, setEditPiezas] = useState(false);

  /* Manejadores de eventos */
  const handleChangeBruto = (e) => {
    const { value } = e.target;

    calcular({ ...pesaje, PesoBruto: parseFloat(value) });
  };

  const handlePiezasClick = (e) => {
    if (!pesaje.producto.Cantidad) return;
    setEditPiezas(!editPiezas);
  };

  const handleChangePiezas = (e) => {
    const { value } = e.target;

    let tempProd = pesaje.producto;
    tempProd.Cantidad = parseFloat(value);
    calcular({ ...pesaje, producto: tempProd });
  };

  const handleChangePeso = (indice) => (e) => {
    const esNumero = /^[0-9]+([.])?([0-9]+)?$/;
    let taraTemp = pesaje.Taras;

    if (!e.target.innerText.trim().match(esNumero)) {
      e.target.innerHTML = "</br>";
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
    const user = JSON.parse(localStorage.getItem("auth")) || {};
    let tarasTemp = [];
    try {
      const result = await fetch(
        `${BASE_URL}iElemTara/ElementosTaraDatos?pUsuario=${user.usuario}&pToken=${user.Token}`
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
    if (taraFinal.PesoBruto !== 0) {
      taraFinal.PesoNeto = taraFinal.PesoBruto - taraFinal.TaraTotal;
      taraFinal.PesoPorPieza = parseFloat(
        (taraFinal.PesoNeto / taraTemp.producto.Cantidad).toFixed(3)
      );
    }

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
                min={0}
                type="number"
                name="piezas"
                id="piezas"
                disabled={!editPiezas}
                value={pesaje.producto.Cantidad}
                onChange={handleChangePiezas}
              />
              <button onClick={handlePiezasClick}>Cambiar</button>
            </div>
          </div>
          <div className="flex-input bruto-input">
            <label htmlFor="bruto">Peso Bruto</label>
            <input
              type="number"
              name="bruto"
              id="bruto"
              step={0.5}
              inputMode="decimal"
              onChange={handleChangeBruto}
              value={pesaje.PesoBruto}
            />
          </div>
          <div className="flex-input ">
            <div className="tara-input">
              <label htmlFor="tara">Tara</label>
              <input
                type="number"
                name="tara"
                id="tara"
                disabled
                value={pesaje.TaraTotal}
              />
            </div>
          </div>
          <div className="flex-input neto-input">
            <label htmlFor="neto">Peso Neto</label>
            <input
              disabled
              type="number"
              name="neto"
              id="neto"
              value={pesaje.PesoNeto}
            />
          </div>
          <div className="flex-input pesoPieza-input">
            <label htmlFor="pesoPieza">Peso por Pieza</label>
            <input
              disabled
              type="number"
              name="pesoPieza"
              id="pesoPieza"
              value={pesaje.PesoPorPieza}
            />
          </div>
          <div className="botones-form">
            <button onClick={onCancelar} className="boton-form boton-cancelar">
              Cancelar
            </button>
            <button
              disabled={!(pesaje.PesoPorPieza > 0)}
              onClick={onGuardar(pesaje)}
              className="boton-form">
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
                    onSelect={handleChange(index)}></td>
                  {tara.PesoEditable ? (
                    <td onSelect={handleChangePeso(index)} contentEditable></td>
                  ) : (
                    <td>{tara.Peso}</td>
                  )}
                  <td>{tara.subTotal}</td>
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
