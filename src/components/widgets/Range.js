import React from "react";
import PropTypes from "prop-types";

import "./Range.scss";

const Range = (props) => {
  const { min, max, avg } = props;
  const css = {
    left:
      Math.round(max === min ? 0 : ((avg - min) / (max - min)) * 200) +
      6 +
      "px",
  };

  if (min === max || avg === undefined) {
    return null;
  }
  return (
    <div className="evo-range">
      <div className="range-line">
        <div className="range-line" />
      </div>
      <div style={css} className="range-avg">
        <div>{avg}</div>
      </div>
    </div>
  );
};

export default Range;

Range.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  avg: PropTypes.number,
};
