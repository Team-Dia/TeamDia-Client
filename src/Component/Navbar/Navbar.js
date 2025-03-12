import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../image/logo.png";
import DropdownMenu from "./DropdownMenu";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null); // 타이머 ID를 저장할 상태
  const [isMouseOverDropdown, setIsMouseOverDropdown] = useState(false); // 드롭다운에 마우스가 있는지 추적

  // 카테고리 메뉴에 마우스를 올리면 드롭다운 열기
  const handleMouseEnterCategory = () => {
    setIsDropdownOpen(true);
    if (timeoutId) {
      clearTimeout(timeoutId); // 이미 타이머가 설정된 경우 취소
    }
  };

  const handleMouseLeaveCategory = (event) => {
    const relatedTarget = event.relatedTarget;

    // relatedTarget이 존재하지 않으면 드롭다운을 닫기 위한 타이머 설정
    if (!relatedTarget) {
        const newTimeoutId = setTimeout(() => {
            if (!isMouseOverDropdown) {
                setIsDropdownOpen(false);
            }
        }, 500);
        setTimeoutId(newTimeoutId);
        return;
    }

    // `relatedTarget.closest`가 존재하는지 확인하고 드롭다운 내부인지 검사
    if (
        typeof relatedTarget.closest === "function" && (
            relatedTarget.closest(".category-link") || 
            relatedTarget.closest(".dropdown-wrapper")
        )
    ) {
        return;
    }

    // 드롭다운을 닫기 위한 타이머 설정
    const newTimeoutId = setTimeout(() => {
        if (!isMouseOverDropdown) {
            setIsDropdownOpen(false);
        }
    }, 500);
    
    setTimeoutId(newTimeoutId);
};


  // 드롭다운에 마우스가 들어오면 타이머 취소
  const handleMouseEnterDropdown = () => {
    setIsMouseOverDropdown(true);
    if (timeoutId) {
      clearTimeout(timeoutId); // 드롭다운에 마우스가 오면 타이머 취소
    }
  };

  // 드롭다운에서 마우스가 나가면 일정 시간 후에 닫기
  const handleMouseLeaveDropdown = () => {
    setIsMouseOverDropdown(false);
    const newTimeoutId = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 500ms 후에 닫기
    setTimeoutId(newTimeoutId); // 타이머 ID 저장
  };

  return (
    <div className={`nav-wrapper ${isDropdownOpen ? "expanded" : ""}`}>
    <div className="nav-container">
        
      <div className="nav-bar">
      <Link to="/" id="home-link" className="logo">
            <img src={logo} alt="logo" id="nav-logo" />
          </Link>
        <div className="nav-left">
          
          <SearchBar />
        </div>

        {/* 중앙 (메뉴) */}
        <div 
            className="nav-center"
            onMouseEnter={handleMouseEnterCategory}
            onMouseLeave={handleMouseLeaveCategory}
            >
            <Link id="category-link">카테고리</Link>

            {/* ✅ 기존 골드/실버 링크 대신 새로운 필터링 페이지로 연결 */}
            <Link to="/gold-silver?material=골드" id="menu-link">골드</Link>
            <Link to="/gold-silver?material=실버" id="menu-link">실버</Link>

            <Link to="/Customer" id="menu-link">고객센터</Link>
            </div>


        {/* 오른쪽 (로그인, 마이페이지, 장바구니) */}
        <div className="nav-right">
          <UserMenu />
        </div>
      </div>
    </div>

      {/* 드롭다운 전체를 감싸는 요소 */}
      <div
        className={`dropdown-wrapper ${isDropdownOpen ? "visible" : ""}`}
        onMouseEnter={handleMouseEnterDropdown} // 드롭다운에 마우스가 들어갔을 때
        onMouseLeave={handleMouseLeaveDropdown} // 드롭다운에서 마우스가 나갔을 때
      >
        <DropdownMenu />
      </div>
    </div>
  );
};

export default Navbar;
