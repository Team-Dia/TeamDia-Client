import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import { FaHeart } from "react-icons/fa";
import defaultPlaceholder from "../../Component/image/default-placeholder.jpg";
import "./Wishlist.css";

const WishlistItem = ({ item, onRemove }) => {
  // onRemove(삭제)함수 추가
  const navigate = useNavigate();
  const product = item.product;
  const [isLiked, setIsLiked] = useState(true); // ✅ 초기값: 좋아요 상태
  const imageUrl = product.productImage
    ? `http://localhost:8070/product_images/${product.productImage}`
    : defaultPlaceholder; // ✅ 기본 이미지 적용

  console.log("✅ product.productImage:", product.productImage); // 이미지 경로 확인용

  // 🔹 좋아요 토글 함수 추가
  const handleLikeToggle = () => {
    setIsLiked(false); // ✅ UI에서 회색 하트로 변경
    onRemove(item.likeSeq, product.productSeq); // ✅ 부모 컴포넌트에서 상태 업데이트
  };

  // ✅ 제품 클릭 시 productDetail 페이지로 이동
  const handleProductClick = (productSeq) => {
    navigate(`/producDetail/${productSeq}`);
  };

  return (
    <div className="wishlist-item">
      <div className="wishlist-image-wrapper">
        <img
          src={imageUrl} // 동적 이미지 경로
          alt={product.productName || "상품명 없음"}
          className="wishlist-img"
          onClick={() => handleProductClick(product?.productSeq)} // ✅ 클릭 이벤트 추가
        />
        {/* ✅ 클릭 시 좋아요 취소 */}
        <FaHeart
          className={`wishlist-heart ${isLiked ? "liked" : ""}`}
          onClick={handleLikeToggle}
        />
      </div>
      <p className="wishlist-name">{product.productName || "상품명 없음"}</p>
      <p className="wishlist-price">
        {(product.productCostPrice ?? 0).toLocaleString()}원
      </p>
    </div>
  );
};

export default WishlistItem;
