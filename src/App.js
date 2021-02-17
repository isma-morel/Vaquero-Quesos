import "./App.css";
import { Login } from "./componentes";
import { logo } from "./logo.json";
function App() {
  return (
    <div>
      <img src={logo} alt="Logo Vaquero" />
      <hr />
      <Login />
    </div>
  );
}

export default App;
