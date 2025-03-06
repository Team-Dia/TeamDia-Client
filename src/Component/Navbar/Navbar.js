import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../image/logo.png';
import DropdownMenu from './DropdownMenu';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // ✅ Navbar 및 Dropdown 내부에서 벗어나면 닫히도록 처리
    const handleMouseLeave = (event) => {
        const relatedTarget = event.relatedTarget;

        // ✅ `relatedTarget`이 `null`이면 바로 닫기
        if (!relatedTarget || !(relatedTarget instanceof Element)) {
            setIsDropdownOpen(false);
            return;
        }

        // ✅ Navbar 및 Dropdown 내부에 있는지 확인
        if (relatedTarget.closest('.nav-container') || relatedTarget.closest('.dropdown-wrapper')) {
            return;
        }

        setIsDropdownOpen(false);
    };

    return (
        <div className={`nav-wrapper ${isDropdownOpen ? "expanded" : ""}`} 
             onMouseEnter={() => setIsDropdownOpen(true)} 
             onMouseLeave={handleMouseLeave}>
             
            <div className='nav-container'>
                <div className='nav-bar'>
                    {/* 왼쪽 (로고 + 검색) */}
                    <div className='nav-left'>
                        <Link to='/' id='home-link' className='logo'>
                            <img src={logo} alt="logo" id="nav-logo" />
                        </Link>
                        <SearchBar />
                    </div>

                    {/* 중앙 (카테고리 메뉴 + 고객센터) */}
                    <div className="nav-center">
                        <Link id="category-link">카테고리</Link>
                        <Link to="/Customer" id="menu-link">고객센터</Link>
                    </div>

                    {/* 오른쪽 (로그인, 마이페이지, 장바구니) */}
                    <div className='nav-right'>
                        <UserMenu />
                    </div>
                </div>
            </div>

            {/* ✅ Navbar와 드롭다운 전체를 감싸는 요소 */}
            <div className={`dropdown-wrapper ${isDropdownOpen ? "visible" : ""}`}>
                <DropdownMenu />
            </div>
        </div>
    );
};

export default Navbar;
