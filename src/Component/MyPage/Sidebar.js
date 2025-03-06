import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* 1024px 이하에서 보이는 햄버거 버튼 */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>

            {/* 사이드바 */}
            <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-title">마이페이지</div>

                <div className="sidebar-section">
                    <h3>혜택정보</h3>
                    <ul>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/mypage/points" ? "active" : ""}`}
                                onClick={() => navigate("/mypage/points")}
                            >
                                포인트
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h3>내 활동</h3>
                    <ul>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/mypage/orders" ? "active" : ""}`}
                                onClick={() => navigate("/mypage/orders")}
                            >
                                주문 내역
                            </div>
                        </li>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/mypage/reviews" ? "active" : ""}`}
                                onClick={() => navigate("/mypage/reviews")}
                            >
                                작성한 리뷰
                            </div>
                        </li>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/mypage/wishlistPage" ? "active" : ""}`}
                                onClick={() => navigate("/mypage/wishlistPage")}
                            >
                                좋아요한 상품
                            </div>
                        </li>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/mypage/recentlyViewedPage" ? "active" : ""}`}
                                onClick={() => navigate("/mypage/recentlyViewedPage")}
                            >
                                최근 본 상품
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h3>고객센터</h3>
                    <ul>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/qnaList" ? "active" : ""}`}
                                onClick={() => navigate("/qnaList")}
                            >
                                문의 내역
                            </div>
                        </li>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/notice" ? "active" : ""}`}
                                onClick={() => navigate("/notice")}
                            >
                                공지 사항
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h3>설정</h3>
                    <ul>
                        <li>
                            <div
                                className={`sidebar-link ${location.pathname === "/mypage/edit-profile" ? "active" : ""}`}
                                onClick={() => navigate("/mypage/edit-profile")}
                            >
                                회원정보 수정
                            </div>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
