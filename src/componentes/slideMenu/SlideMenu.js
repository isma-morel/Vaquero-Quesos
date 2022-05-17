import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./SlideMenu.css";

/**
 *
 * @param {[{to:string,icono:Icon, texto:string, sub:[{}]}]} param0
 *
 * @arugments to: ruta a la que se va a dirigir el Link
 * @arugments icono: icono que se va a mostrar en el elemento
 * @arguments texto: label que va a tener el elemento
 * @arguments sub: arreglo de items del menu.
 */
const SlideMenu = ({ Items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ItemState, setItemState] = useState([]);
  useEffect(() => {
    setItemState(
      Items.map((item) => {
        if (item?.sub) {
          item.sub.open = false;
        }
        return item;
      })
    );
  }, [Items]);
  const handleMenuClick = (e) => {
    setIsOpen(false);
  };
  const handleClick = (e) => {
    setIsOpen(!isOpen);
  };

  const handleSubMenu = (Itemindex) => (e) => {
    let itemStateTemp = ItemState.map((item, index) => {
      if (index === Itemindex) {
        item.sub.open = !item.sub.open;
      } else if (item?.sub) {
        item.sub.open = false;
      }
      return item;
    });
    setItemState(itemStateTemp);
  };
  return (
    <>
      <div className="Bread" onClick={handleClick}>
        <i className="fas fa-bars"></i>
      </div>
      <div className={`slide  ${isOpen ? "openSlide" : "closeSlide"}`}>
        <div className="Bread" onClick={handleClick}>
          <i className="fas fa-bars"></i>
        </div>

        <ul className="menu">
          {ItemState?.map((item, index) => (
            <div key={index}>
              <li onClick={item.to ? () => {} : handleSubMenu(index)}>
                <NavLink
                  onClick={handleMenuClick}
                  className="link"
                  to={item?.to || "#"}>
                  {item.icono}
                  <span>{isOpen ? item.texto : ""}</span>
                </NavLink>
              </li>
              {item.sub ? (
                <ul
                  className={`submenu  ${item.sub.open ? "Open" : "Close"}`}
                  id={index}>
                  {item.sub?.map((sub, index) => (
                    <li key={index} className="submenu-item">
                      <NavLink to={sub.to} className="link">
                        {sub.icono}
                        {isOpen ? sub.texto : ""}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SlideMenu;
