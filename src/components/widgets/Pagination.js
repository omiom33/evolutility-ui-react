// Evolutility-UI-React :: /widget/Pagination.js

// Pagination for List and Cards views (styled w/ Bootstrap).

// https://github.com/evoluteur/evolutility-ui-react
// (c) 2022 Olivier Giulieri

import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";
import { pageSize } from "../../config";

import "./Pagination.scss";

const Pagination = ({ pageIdx, count, fullCount, location, fnClick }) => {
  const paginationBody = () => {
    let pIdx;
    const query = queryString.parse(location.search); // this.props.location.query

    if (query) {
      // if(query.page==='p--' || query.page==='p++'){
      // }
      pIdx = parseInt(query.page || "0", 10);
    } else {
      pIdx = 0;
    }
    const h = [];
    let gapIdx = 0;

    if (fullCount > count && !(pIdx === 0 && count < pageSize)) {
      const nbPages = Math.ceil(fullCount / pageSize);
      const wPrev = pIdx > 0;
      const wNext = nbPages > pIdx + 1;
      const pId = pIdx + 1;
      const bPage = function (id) {
        h.push(
          <li key={id} className={pId === id ? "active" : ""} onClick={fnClick}>
            <span className="fakeLink">{id}</span>
          </li>
        );
      };
      const bPageRange = (pStart, pEnd) => {
        for (let i = pStart; i <= pEnd; i++) {
          bPage(i);
        }
      };
      const bGap = (idx) => {
        h.push(
          <li key={"gap" + idx} className="disabled">
            <span className="fakeLink">...</span>
          </li>
        );
      };

      h.push(
        <li
          key="prev"
          className={wPrev ? "" : "disabled"}
          onClick={wPrev ? fnClick : null}
        >
          <span className="fakeLink">&laquo;</span>
        </li>
      );
      bPage(1);

      if (nbPages < 17) {
        bPageRange(2, nbPages);
      } else if (pId < 5) {
        bPageRange(2, 5);
        if (nbPages > 5) {
          bGap(gapIdx++);
          bPage(nbPages);
        }
      } else {
        bGap(gapIdx++);
        bPageRange(pId - 2, Math.min(pId + 2, nbPages));
        if (nbPages > pId + 2) {
          if (nbPages > pId + 3) {
            bGap(gapIdx++);
          }
          bPage(nbPages);
        }
      }

      h.push(
        <li
          key="next"
          className={wNext ? "" : "disabled"}
          onClick={wNext ? fnClick : null}
        >
          <span className="fakeLink">&raquo;</span>
        </li>
      );
    }
    return h;
  };

  return (
    fullCount > pageSize && (
      <nav className="clearer">
        <ul className="pagination">{paginationBody()}</ul>
      </nav>
    )
  );
};

export default Pagination;

Pagination.propTypes = {
  pageIdx: PropTypes.number,
  count: PropTypes.number.isRequired,
  fullCount: PropTypes.number.isRequired,
  location: PropTypes.object,
  fnClick: PropTypes.func.isRequired,
};

Pagination.defaultProps = {
  pageIdx: 0,
};
