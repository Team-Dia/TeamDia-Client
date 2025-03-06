import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginAction } from "../../store/userSlice"; // Redux 액션 추가
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import WishlistItem from "./WishlistItem";
import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import Wishlist from './Wishlist';  // ✅ 공통 컴포넌트 사용
import "./Wishlist.css";
import jaxios from "../../util/jwtUtil";

const WishlistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loginUser = useSelector(state => state.user); // Redux에서 로그인 상태 가져오기
    const [wishlistItems, setWishlistItems] = useState([]);
    const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");
    const [reviewCount, setReviewCount] = useState();
    const [couponCount, setCouponCount] = useState();
    const [points, setPoints] = useState();
    const [user, setUser] = useState(null);
    const [likeList, setLikeList] = useState([])
    const {productSeq} = useParams();

    // ✅ localStorage에서 로그인 정보 가져오기
    const getStoredUser = () => {
        const storedUserStr = localStorage.getItem("loginUser");
        if (storedUserStr) {
            try {
                return JSON.parse(storedUserStr);
            } catch (error) {
                console.error("❌ 로그인 정보 파싱 오류:", error);
            }
        }
        return null;
    };

    // ✅ Redux 상태 업데이트를 기다린 후 로그인 여부 확인
    useEffect(() => {
        if (!loginUser?.memberId) {
            const storedUser = getStoredUser();
            if (!storedUser?.memberId) {
                console.warn("🚨 로그인 정보 없음 → 로그인 페이지 이동");
                navigate("/login");
                return;
            }
            console.log("✅ Redux 상태 업데이트: ", storedUser);
            dispatch(loginAction(storedUser));
        }
    }, [loginUser, dispatch, navigate]); // ✅ Redux 상태 변경 시 한 번만 실행되도록 조정
    
    async function fetchUserLikes() {
        if (!loginUser?.memberId) return;
        if (loginUser && loginUser.memberId) {
            try {
                const params = {
                    memberId: loginUser.memberId,
                };
                if (productSeq) {
                    params.productSeq = productSeq;
                }
                // const response = await axios.get('/api/post/getUserLikes', { params });
                const response = await jaxios.get(`/api/post/getUserLikes?memberId=${loginUser.memberId}`, {
                    headers: {
                        'Cache-Control': 'no-cache', // ✅ 캐싱 방지하여 최신 데이터 가져오기
                    },
                });
                console.log("📡 서버 응답 데이터:", response.data); // ✅ 백엔드에서 데이터가 올바르게 오는지 확인

                // ✅ 서버에서 받은 데이터 변환 (memberId를 명확하게 추출)
                const transformedData = response.data.map(item => ({
                    ...item,
                    memberId: item.member ? item.member.memberId : null, // ✅ member 객체에서 memberId 추출
                }));
        
                console.log("✅ 최신 좋아요 목록 업데이트:", transformedData);
                setWishlistItems(transformedData);
            } catch (error) {
                console.error('좋아요 목록을 가져오는 중 오류 발생:', error);
            }
        }
    }

    // ✅ 좋아요 취소 기능 추가
    const handleRemoveLike = async (likeSeq, productSeq) => {
        try {
            const apiUrl = `/api/post/removeLike?memberId=${loginUser.memberId}&productSeq=${productSeq}`;
            await jaxios.delete(apiUrl);

            // ✅ UI에서 즉시 제거
            setWishlistItems(prevItems => prevItems.filter(item => item.likeSeq !== likeSeq));
            console.log("✅ 좋아요 취소 성공:", productSeq);

            // ✅ 최신 데이터를 가져오기 전에 약간의 딜레이 추가 (서버 응답 반영 시간 고려)
            setTimeout(() => {
                fetchUserLikes();
            }, 500); // 0.5초 딜레이 후 최신 데이터 불러오기
        } catch (error) {
            console.error("❌ 좋아요 취소 오류:", error);
        }
    };

    // ✅ 페이지 로드 시 최신 좋아요 목록 가져오기 (이전 데이터와 다를 경우에만)
    useEffect(() => {
        if (!loginUser?.memberId) return;
        fetchUserLikes();
    }, [loginUser.memberId]);   

    // ✅ UI 높이 자동 조정
    useEffect(() => {
        const adjustHeight = () => {
            const container = document.querySelector(".mypage-container");
            if (container) {
                container.style.height = "auto"; // ✅ 높이 자동 조정
            }
        };
        adjustHeight(); // 초기 조정
        window.addEventListener("resize", adjustHeight);
        return () => window.removeEventListener("resize", adjustHeight);
    }, [wishlistItems]);

    

    return (
        <div className="mypage-container">
            <div className="mypage-box">
            <div className="mypage-wrapper">
                <Sidebar />
                <div className="mypage-content">
                    <ProfileCard 
                        nickname={nickname} 
                        couponCount={couponCount} 
                        points={points} 
                    />
<div className="points-section">
                    <h2>좋아요한 상품</h2>
                        <div className="wishlist-items-list">
                            {wishlistItems && wishlistItems.length > 0 ? (
                                wishlistItems.map((item, index) => (
                                    <WishlistItem 
                                        key={`${item.likeSeq}-${index}`} 
                                        item={item}
                                        onRemove={handleRemoveLike} // ✅ 좋아요 취소 기능 추가
                                    />
                                ))
                            ) : (
                                <p>좋아요한 상품이 없습니다.</p>
                            )}
                        </div>

                  </div>
               </div>
               </div>
          </div>
          </div>
                );
    };

export default WishlistPage;
