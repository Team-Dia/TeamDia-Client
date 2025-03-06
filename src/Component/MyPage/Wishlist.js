import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import WishlistItem from "./WishlistItem"; // ✅ 공통 컴포넌트 사용
import "./Wishlist.css";
import jaxios from "../../util/jwtUtil";

const Wishlist = ({ favoriteItems }) => {
    const loginUser = useSelector(state => state.user); // Redux에서 로그인 상태 가져오기
    const { productSeq } = useParams();
    
    // ✅ Redux 상태를 우선 사용하고, 없으면 localStorage에서 가져옴
    const storedUser = localStorage.getItem("loginUser");
    const user = loginUser?.memberId ? loginUser : storedUser ? JSON.parse(storedUser) : null;

    const [wishlistItems, setWishlistItems] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false); // ✅ 중복 요청 방지
    const [likeList, setLikeList] = useState([]);

    // ✅ 로그인 정보 체크
    useEffect(() => {
        if (!user || Object.keys(user).length === 0) return; // 초기 `null` 또는 `{}` 상태면 실행 안 함
    
        console.log("🚨 Wishlist에서 로그인 확인:", user);
        if (!user?.memberId) {
            console.warn("❌ 로그인 정보 없음 → Redux 상태 업데이트 대기");
        }
    }, [user]);
    

    // ✅ favoriteItems 업데이트 시 상태 업데이트
    useEffect(() => {
        console.log("📡 Wishlist.js - favoriteItems 업데이트:", favoriteItems);
        if (Array.isArray(favoriteItems)) {
            setWishlistItems(favoriteItems);
        }
    }, [favoriteItems]);

    // ✅ 로그인 정보 변경 시 좋아요 목록 업데이트
    useEffect(() => {
        if (user && user.memberId) {
            console.log('✅ 로그인 정보 업데이트:', user);
            fetchUserLikes(productSeq);
        }
    }, [user, productSeq]);  

    // ✅ 좋아요한 상품 목록 불러오기
    async function fetchUserLikes(productSeq = null) {
        if (!user?.memberId) return;  // 로그인 정보 없으면 실행 안 함
        if (user && user.memberId) {
            try {
                const params = { memberId: user.memberId };
                if (productSeq) params.productSeq = productSeq;

                const response = await jaxios.get('/api/post/getUserLikes', { params });

                // 서버 응답 데이터 검증 및 변환
                const transformedData = response.data.map(item => ({
                    ...item,
                    memberId: item.member ? item.member.memberId : null,
                }));

                setLikeList(transformedData);
                setWishlistItems(response.data);
                console.log("✅ 좋아요 목록 업데이트:", transformedData);
            } catch (error) {
                console.error('❌ 좋아요 목록을 가져오는 중 오류 발생:', error);
            }
        }
    }

    // ✅ 좋아요 취소 후 목록에서 즉시 삭제하는 함수(wishList 에서 관리)
    const handleRemoveLike = async (likeSeq, productSeq) => {
        if (isProcessing) return; // ✅ 이미 처리 중이면 실행하지 않음
        setIsProcessing(true);
        try {
            const apiUrl = `/api/post/removeLike?memberId=${user.memberId}&productSeq=${productSeq}`;
            await jaxios.delete(apiUrl);

            // ✅ UI에서 즉시 제거
            setWishlistItems(prevItems => prevItems.filter(item => item.likeSeq !== likeSeq));
            // setLikeList(prevLikes => prevLikes.filter(item => item.likeSeq !== likeSeq));

            console.log("✅ 좋아요 취소 성공:", productSeq);

            // ✅ 삭제 후 서버에서 최신 데이터 다시 불러오기
            setWishlistItems(prevItems => prevItems.filter(item => item.likeSeq !== likeSeq));
        } catch (error) {
            console.error("❌ 좋아요 취소 오류:", error);
        } finally{
            setIsProcessing(false);
        }
    };

    return (
        <div className="mypage-wishlist">
            <div className="wishlist-container">
                {wishlistItems.length > 0 ? (
                    <div className="wishlist-wrapper">
                        <div className="wishlist-items-list">
                            {wishlistItems.slice(0, 8).map((item) => (  // 여기에서 8개까지만 렌더링
                                <WishlistItem key={`${item.likeSeq}`} item={item} onRemove={handleRemoveLike} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="no-wishlist">위시리스트에 담긴 상품이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
