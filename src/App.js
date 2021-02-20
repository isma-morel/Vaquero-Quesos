import { useState } from "react";
import "./App.css";
import { Login, Lista } from "./componentes";
import { logo } from "./logo.json";
import { granVaquero } from "./GranVaquero.json";
function App() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  return (
    <div className="contenedor">
      <Login logo={logo} />
    </div>
  );
}

const Listado = () => {
  return (
    <div className="contenedor">
      <div className="contenedor__landing">
        <img src={logo} alt="Logo Vaquero" />

        <div className="contenedor__titulo" style={{}}>
          <h2>MAYORISTAS - 57| 22/01/2021</h2>
          <hr />
        </div>
      </div>

      <div className="contenedor__lista">
        <Lista />
      </div>
    </div>
  );
};

export default App;
