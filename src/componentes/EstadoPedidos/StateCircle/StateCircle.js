import "./StateCircle.css";

export const StateCircle = ({ avance }) => {
  const ColorState = (value) => {
    switch (value) {
      case 100:
        return "rgb(80, 199, 80)";
      case 0:
        return "rgb(243, 60, 60)";
      default:
        return "rgb(216, 94, 49)";
    }
  };
  return (
    <span
      className="circleState"
      style={{ backgroundColor: ColorState(avance) }}
    ></span>
  );
};
