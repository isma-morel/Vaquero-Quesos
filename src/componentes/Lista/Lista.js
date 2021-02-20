import "./Lista.css";
import productos from "./Productos.json";
function Lista() {
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>CODIGO</th>
          <th>PRODUCTO</th>
        </tr>
      </thead>
      <tbody>
        {productos.map(({ producto, codigo, descripcion }, index) => (
          <tr key={index}>
            <td>
              <span className="codigo">{codigo}</span>
            </td>
            <td className="producto">
              <div>
                <span className="titulo">{producto}</span>
                <span className="descripcion">{descripcion}</span>
              </div>

              <span className="foto">
                <i className="fas fa-camera"></i>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Lista;
