import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import "./SearchItem.css"; // ✅ 개별 상품 스타일 적용
import defaultPlaceholder from "../../Component/image/default-placeholder.jpg"; // 기본 이미지
import jaxios from "../../util/jwtUtil";

const SearchItem = ({ product }) => {
    const user = useSelector(state => state.user);
    const [isLiked, setIsLiked] = useState(product.isLiked); // ✅ 서버에서 받은 좋아요 여부 적용
    const navigate = useNavigate();
    useEffect(() => {
        console.log(`🛒 상품명: ${product.productName} | 초기 좋아요 상태: ${product.isLiked}`);
    }, [product]);

    const handleLikeToggle = async () => {
        if (!user?.memberId) {
            alert("로그인이 필요합니다."); // ✅ 로그인하지 않은 사용자는 좋아요 불가
            navigate("/login")
            return;
        }

        try {
            if (isLiked) {
                await jaxios.delete(`/api/post/removeLike?memberId=${user.memberId}&productSeq=${product.productSeq}`);
            } else {
                await jaxios.post(`/api/post/addLike`, { 
                    memberId: user.memberId, 
                    productSeq: product.productSeq 
                });
            }
            setIsLiked(!isLiked);
            console.log(`❤️ 좋아요 변경: ${product.productName} | 상태: ${!isLiked}`);
        } catch (error) {
            console.error("❌ 좋아요 처리 중 오류 발생:", error);
        }
    };

    return (
        <div 
            className="searchProduct-card" 
            onClick={() => window.location.href = `/producDetail/${product.productSeq}`} // ✅ 상세 페이지 이동 유지
        >
            <div className="searchImage-container">
                <img src={product.productImage ? `http://localhost:8070/product_images/${product.productImage}` : defaultPlaceholder}
                    alt={product.productName} className="searchProduct-image" />
                <FaHeart 
                    className={`product-like-heart ${isLiked ? "liked" : ""}`} 
                    onClick={(e) => {
                        e.stopPropagation(); // ✅ 페이지 이동 방지
                        handleLikeToggle();
                    }} 
                />
            </div>
            <div className="product-details">
                <p className="product-name">{product.productName}</p>
                <p className="product-price">{product.productSalePrice.toLocaleString()}원</p>
            </div>
        </div>
    );
};

export default SearchItem;
