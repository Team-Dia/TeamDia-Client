import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultPlaceholder from "../../Component/image/default-placeholder.jpg";
import "./RecentlyViewed.css"; // 스타일 적용

const RecentlyViewed = () => {
    const [recentProducts, setRecentProducts] = useState([]);
    const navigate = useNavigate();
      // ✅ 기본 이미지 적용

    useEffect(() => {
        const fetchViewedProducts = () => {
            const storedProducts = JSON.parse(localStorage.getItem("viewedProducts")) || [];
            console.log("✅ 최근 본 상품 로드됨:", storedProducts); // 🔹 최근 본 상품 디버깅 로그 추가
            setRecentProducts(storedProducts);
        };

        fetchViewedProducts();
        window.addEventListener("recentlyViewedUpdated", fetchViewedProducts);

        return () => {
            window.removeEventListener("recentlyViewedUpdated", fetchViewedProducts);
        };
    }, []);

    return (
        <div className="recently-viewed-container">
            {recentProducts.length > 0 ? (
                <>
                    <div className="recently-viewed-list">
                        {recentProducts.slice(0, 12).map((product, index) => {  // ✅ 최대 8개까지만 표시
                            console.log("📌 개별 상품 정보:", product); // 🔹 각 상품이 올바르게 로드되는지 확인
                            const imageUrl = product.productImage
                                ? `http://localhost:8070/product_images/${product.productImage}`
                                : defaultPlaceholder; // ✅ 개별 상품별 이미지 처리

                            return (
                                <div key={index} className="recently-viewed-item" onClick={() => navigate(`/producDetail/${product.productSeq}`)}>
                                    <img 
                                        src={imageUrl}  // 동적 이미지 경로
                                        alt={product.productName || "상품명 없음"}  
                                        className="recently-viewed-img"
                                    />
                                    <div className="recently-viewed-info">
                                        <p className="recently-viewed-name">{product.productName}</p>
                                        <p className="recently-viewed-price">{product.productPrice.toLocaleString()}원</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {recentProducts.length > 8 && ( // ✅ 8개 초과일 때만 버튼 표시
                        <button className="view-more-btn" onClick={() => navigate("/mypage/recentlyViewedPage")}>
                            전체 최근 본 상품 보기
                        </button>
                    )}
                </>
            ) : (
                <p>최근 본 상품이 없습니다.</p>
            )}
        </div>
    );
};

export default RecentlyViewed;