import { React, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Cookies } from 'react-cookie';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAction, loginAction } from '../../store/userSlice';

import './Navbar.css';
import logo from '../image/logo.png';
import jaxios from '../../util/jwtUtil';

const Navbar = () => {
    const cookies = new Cookies();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    useEffect(() => {
        if (!user?.memberId || user.memberId === "") {
            console.log("🚨 [Navbar.js] 로그인하지 않은 사용자 → `userinfo` 요청 안 함");
            return;
        }
    
        let isMounted = true;
    
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get("/api/member/userinfo", { withCredentials: true });
                if (isMounted && response.data?.memberId) {
                    dispatch(loginAction(response.data));  
                }
            } catch (error) {
                if (isMounted && error.response?.status === 401) {
                    console.log("🚨 [Navbar.js] 401 Unauthorized 발생 → 현재 로그아웃 상태인지 확인");
                    
                    if (user?.memberId && user.memberId !== "") {  // ✅ 로그아웃된 상태라면 실행하지 않음
                        console.log("🛑 [Navbar.js] 이미 로그아웃된 상태이므로 추가 로그아웃 처리 안 함.");
                    }
                }
            }
        };
    
        checkLoginStatus();
    
        return () => {
            isMounted = false;
        };
    }, [dispatch, user?.memberId]);  // ✅ `user.memberId === ""`일 때 실행되지 않도록 방지
    
    const handleLogout = () => {
        console.log("🔴 [Navbar.js] 로그아웃 버튼 클릭 - Redux 상태 초기화");
    
        // ✅ Redux 상태를 즉시 초기화하여 `useEffect` 실행 방지
        dispatch(logoutAction());
        localStorage.removeItem("loginUser"); 
    
        setTimeout(() => {  // ✅ 100ms 딜레이 후 서버 요청 실행하여 `useEffect` 실행 방지
            jaxios.post("/api/member/logout", {}, { withCredentials: true })
                .then(() => {
                    console.log("✅ [Navbar.js] 서버 로그아웃 성공");
                    alert("로그아웃이 완료되었습니다.");  // ✅ 로그아웃 성공 시 알림 추가
                })
                .catch(error => {
                    console.error("🚨 [Navbar.js] 로그아웃 실패:", error);
                    alert("로그아웃 처리 중 오류가 발생했습니다.");
                })
                .finally(() => {
                    window.location.href = "/";  // ✅ 메인 페이지로 이동
                });
        }, 100);  
    };

    const handleMyPageClick = (event) => {
        if (!user?.memberId) {  // ✅ 로그인 상태 확인
            event.preventDefault();  // ✅ 기본 이동 막기
            alert("로그인 후 사용할 수 있습니다.");
            navigate("/login");  // ✅ 로그인 페이지로 이동
        }
    };
    
    const [searchKeyword, setSearchKeyword] = useState("");
    const handleSearch = () => {
        if (searchKeyword.trim() !== "") {
            sessionStorage.removeItem("searchKeyword"); // ✅ 메인으로 이동할 때 검색어 삭제
            setSearchKeyword(""); // ✅ 입력 필드 초기화

            // ✅ 새로운 검색 시 가격 필터링 초기화
            const newParams = new URLSearchParams();
            newParams.set("keyword", searchKeyword.trim()); // ✅ 새로운 검색어 설정
            newParams.delete("minPrice"); // ✅ 기존 가격 필터 삭제
            newParams.delete("maxPrice");
            // navigate(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
            navigate(`/search?${newParams.toString()}`); // ✅ 가격 필터링 초기화 후 이동
        }
    };
    

    // 카테고리 메뉴 상태 (드롭다운 보이기/숨기기)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isNecklaceOpen, setIsNecklaceOpen] = useState(false);
    const [isEarringOpen, setIsEarringOpen] = useState(false);
    const [isRingOpen, setIsRingOpen] = useState(false);
    const [isBraceletOpen, setIsBraceletOpen] = useState(false);
    
    return (
        <div className='nav-container'>
            <div className='nav-bar'>
                {/* 왼쪽 */}
                <div className='nav-left'>
                    <div className='logo'>
                        <Link to='/' id='home-link'>
                            <img src={logo} alt="logo" id="nav-logo" />
                        </Link>
                    </div>

                    <div className='search'>
                        <i className="ri-search-line" onClick={handleSearch}></i>  {/* 클릭 시 검색 실행 */}
                        <input 
                            type='text' placeholder='Search...' id='search-text'
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                        />
                    </div>
                </div>

                {/* 중간 */}
                <div className="nav-center">
                    <div
                        className="category-wrapper"
                        onMouseEnter={() => setIsCategoryOpen(true)}
                        onMouseLeave={() => setIsCategoryOpen(false)}
                    >
                        <Link id="category-link">카테고리</Link>
                        {isCategoryOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-item"
                                    onMouseEnter={() => setIsRingOpen(true)}
                                    onMouseLeave={() => setIsRingOpen(false)}
                                >
                                    <Link to="/ring" className="dropdown-item">반지</Link>
                                    {isRingOpen && (
                                        <div className="sub-dropdown-menu">
                                            <Link to="/ring?subCategory=커플링" className="sub-dropdown-item">커플링</Link>
                                            <Link to="/ring?subCategory=심플" className="sub-dropdown-item">심플</Link>
                                            <Link to="/ring?subCategory=큐빅" className="sub-dropdown-item">큐빅</Link>
                                            <Link to="/ring?subCategory=골드" className="sub-dropdown-item">골드</Link>
                                            <Link to="/ring?subCategory=실버" className="sub-dropdown-item">실버</Link>
                                        </div>
                                    )}
                                </div>
                                <div className="dropdown-item"
                                    onMouseEnter={() => setIsNecklaceOpen(true)}
                                    onMouseLeave={() => setIsNecklaceOpen(false)}
                                >
                                    <Link to="/necklace" className="dropdown-item">목걸이</Link>
                                    {isNecklaceOpen && (
                                        <div className="sub-dropdown-menu">
                                            <Link to="/necklace?subCategory=일체형" className="sub-dropdown-item">일체형</Link>
                                            <Link to="/necklace?subCategory=메달형" className="sub-dropdown-item">메달형</Link>
                                            <Link to="/necklace?subCategory=펜던트" className="sub-dropdown-item">펜던트</Link>
                                            <Link to="/necklace?subCategory=골드" className="sub-dropdown-item">골드</Link>
                                            <Link to="/necklace?subCategory=실버" className="sub-dropdown-item">실버</Link>
                                        </div>
                                    )}
                                </div>
                                <div className="dropdown-item"
                                    onMouseEnter={() => setIsEarringOpen(true)}
                                    onMouseLeave={() => setIsEarringOpen(false)}
                                >
                                    <Link to="/earRing" className="dropdown-item">귀걸이</Link>
                                    {isEarringOpen && (
                                        <div className="sub-dropdown-menu">
                                            <Link to="/earRing?subCategory=피어싱" className="sub-dropdown-item">피어싱</Link>
                                            <Link to="/earRing?subCategory=원터치" className="sub-dropdown-item">원터치</Link>
                                            <Link to="/earRing?subCategory=롱" className="sub-dropdown-item">롱</Link>
                                            <Link to="/earRing?subCategory=골드" className="sub-dropdown-item">골드</Link>
                                            <Link to="/earRing?subCategory=실버" className="sub-dropdown-item">실버</Link>
                                        </div>
                                    )}
                                </div>
                                <div className="dropdown-item"
                                    onMouseEnter={() => setIsBraceletOpen(true)}
                                    onMouseLeave={() => setIsBraceletOpen(false)}
                                >
                                    <Link to="/bracelet" className="dropdown-item">팔찌</Link>
                                    {isBraceletOpen && (
                                        <div className="sub-dropdown-menu">
                                            <Link to="/bracelet?subCategory=체인" className="sub-dropdown-item">체인</Link>
                                            <Link to="/bracelet?subCategory=가죽" className="sub-dropdown-item">가죽</Link>
                                            <Link to="/bracelet?subCategory=큐빅" className="sub-dropdown-item">큐빅</Link>
                                            <Link to="/bracelet?subCategory=골드" className="sub-dropdown-item">골드</Link>
                                            <Link to="/bracelet?subCategory=실버" className="sub-dropdown-item">실버</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* <Link to="/Women" id="menu-link">브랜드</Link> */}
                    <Link to="/bracelet?subCategory=골드" id="menu-link">골드</Link>
                    <Link to="/bracelet?subCategory=실버" id="menu-link">실버</Link>
                    <Link to="/Customer" id="menu-link">고객센터</Link>
                </div>

                {/* 오른쪽 */}
                <div className='nav-right'>
                    

                    {/* ✅ 아이콘 영역 (항상 표시됨) */}
                    <div className='nav-icons'>
                    {user && user.memberId ? (
                        <>
                            <div className="nav-nickname">{user.memberName || user.memberId} 님</div>
                            <div className="nav-item" onClick={handleLogout}>
                                <i className="ri-logout-box-line"></i>
                                <span className="nav-text">Logout</span>
                            </div>
                        </>
                    ) : (
                        <Link to='/login' className='nav-item'>
                            <i className="ri-login-box-line"></i>
                            <span className="nav-text">Login</span>
                        </Link>
                    )}
                    <Link to='/myPage' className='nav-item' id='mypage-link' onClick={handleMyPageClick}>
                        <i className="ri-user-fill"></i>
                        <span className="nav-text">Mypage</span>
                    </Link>

                        <Link to='/cartlist' className='nav-item' id='cart-link'>
                            <i className="ri-shopping-bag-fill"></i>
                            <span className="nav-text">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
