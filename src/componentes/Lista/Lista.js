import "./Lista.css";
import productos from "./Productos.json";
function Lista({ onRowClick }) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>CODIGO</th>
          <th>PRODUCTO</th>
        </tr>
      </thead>
      <tbody>
        {productos.map(({ producto, codigo, descripcion, confoto }, index) => (
          <tr key={index}>
            <td>
              <span className="codigo">{codigo}</span>
            </td>
            <td
              onClick={onRowClick}
              className={`producto ${confoto ? "confoto" : ""}`}>
              <div>
                <span className="titulo">{producto}</span>
                <span className="descripcion">{descripcion}</span>
              </div>
              {confoto ? (
                <span className="foto">
                  <i className="fas fa-camera"></i>
                </span>
              ) : (
                ""
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Lista;
