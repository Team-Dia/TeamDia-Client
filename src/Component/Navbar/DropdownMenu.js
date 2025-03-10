import React from "react";
import { Link } from "react-router-dom";
import "./DropdownMenu.css";

const DropdownMenu = () => {
  return (
    <div className="category-dropdown-container">
      <div className="dropdown-grid">
        <div className="dropdown-column">
          <h4>반지</h4>
          <Link to="/ring?subCategory=커플링">커플링</Link>
          <Link to="/ring?subCategory=심플">심플</Link>
          <Link to="/ring?subCategory=큐빅">큐빅</Link>
          <Link to="/ring?subCategory=골드">골드</Link>
          <Link to="/ring?subCategory=실버">실버</Link>
        </div>

        <div className="dropdown-column">
          <h4>목걸이</h4>
          <Link to="/necklace?subCategory=일체형">일체형</Link>
          <Link to="/necklace?subCategory=메달형">메달형</Link>
          <Link to="/necklace?subCategory=펜던트">펜던트</Link>
          <Link to="/necklace?subCategory=골드">골드</Link>
          <Link to="/necklace?subCategory=실버">실버</Link>
        </div>

        <div className="dropdown-column">
          <h4>귀걸이</h4>
          <Link to="/earRing?subCategory=피어싱">피어싱</Link>
          <Link to="/earRing?subCategory=원터치">원터치</Link>
          <Link to="/earRing?subCategory=롱">롱</Link>
          <Link to="/earRing?subCategory=골드">골드</Link>
          <Link to="/earRing?subCategory=실버">실버</Link>
        </div>

        <div className="dropdown-column">
          <h4>팔찌</h4>
          <Link to="/bracelet?subCategory=체인">체인</Link>
          <Link to="/bracelet?subCategory=가죽">가죽</Link>
          <Link to="/bracelet?subCategory=큐빅">큐빅</Link>
          <Link to="/bracelet?subCategory=골드">골드</Link>
          <Link to="/bracelet?subCategory=실버">실버</Link>
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
