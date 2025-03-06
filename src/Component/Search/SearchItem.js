import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../Category/DisplayPage.css"; // ✅ `DisplayPage.css` 사용
import defaultPlaceholder from "../../Component/image/default-placeholder.jpg"; // 기본 이미지
import jaxios from "../../util/jwtUtil";

const SearchItem = ({ product }) => {
    const user = useSelector(state => state.user);
    const [isLiked, setIsLiked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(`🛒 상품명: ${product.productName} | 초기 좋아요 상태: ${product.isLiked}`);
        setIsLiked(product.isLiked || false);
    }, [product]);

    const handleLikeToggle = async () => {
        if (!user?.memberId) {
            alert("로그인이 필요합니다.");
            navigate("/login");
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
            className="display-product-card" 
            onClick={() => navigate(`/producDetail/${product.productSeq}`)}
        >
            <div className="display-image">
                <img src={product.productImage ? `http://localhost:8070/product_images/${product.productImage}` : defaultPlaceholder}
                    alt={product.productName} className="display-image" />
            </div>
            
            {/* 좋아요 버튼 */}
            <FaHeart 
                className={`product-like-heart ${isLiked ? "liked" : ""}`} 
                onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle();
                }} 
            />

            <div className="display-details">
                {/* ⭐ 별점 및 리뷰 개수 표시 */}
                <div className="display-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <span 
                            key={index} 
                            className={`star ${index < Math.round(product.averageRating) ? "full" : "empty"}`}
                        >
                            ★
                        </span>
                    ))}
                    <span className="review-count">({product.reviewCount})</span>
                </div>
                <h4>{product.productName}</h4>
                <p className="display-price">
                    <span className="sale-price">{product.productSalePrice.toLocaleString()}원</span>
                </p>
            </div>
        </div>
    );
};

export default SearchItem;
