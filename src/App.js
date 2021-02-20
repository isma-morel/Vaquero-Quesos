import { useState } from "react";
import "./App.css";
import { Login, Lista, Modal } from "./componentes";
import { logo } from "./logo.json";
import { granVaquero } from "./GranVaquero.json";
function App() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const handleCloseModal = (e) => {
    setIsOpenModal(false);
  };
  return (
    <div className="contenedor">
      <Modal isOpen={isOpenModal} onClose={handleCloseModal} />
      <Listado setModal={setIsOpenModal} />
    </div>
  );
}

const Listado = ({ setModal }) => {
  const handleRowClick = (e) => {
    console.log(e);
    setModal(true);
  };
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
        <Lista onRowClick={handleRowClick} />
      </div>
    </div>
  );
};

export default App;
