import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../LoadingScreen"; // ✅ 로딩 화면 불러오기
import "./GoldSilverPage.css";

const GoldSilverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  const materialType = searchParams.get("material") || "골드";

  // ✅ 백엔드에서 골드/실버 제품 + 리뷰 불러오기
  useEffect(() => {
    setIsLoading(true);

    axios.get(`/api/product/goldSilverProducts?material=${materialType}`)
      .then((res) => {
        console.log("🔍 불러온 제품 데이터:", res.data);
        const products = res.data || [];

        const productPromises = products.map((product) =>
          axios
            .get(`/api/review/getReview`, { params: { productSeq: product.productSeq } })
            .then((res) => ({
              ...product,
              averageRating: res.data.averageRating || 0,
              reviewCount: res.data.reviewCount || 0,
            }))
            .catch(() => ({
              ...product,
              averageRating: 0,
              reviewCount: 0,
            }))
        );

        return Promise.all(productPromises);
      })
      .then((updatedProducts) => {
        setProducts(updatedProducts);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [materialType]);

  // ✅ 정렬 기능 추가
  useEffect(() => {
    if (!sortBy || products.length === 0) return;

    let sortedItems = [...products];

    if (sortBy === "rating") {
      sortedItems.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === "reviewCount") {
      sortedItems.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === "priceAsc") {
      sortedItems.sort((a, b) => a.productSalePrice - b.productSalePrice);
    } else if (sortBy === "priceDesc") {
      sortedItems.sort((a, b) => b.productSalePrice - a.productSalePrice);
    }

    setProducts(sortedItems);
  }, [sortBy]);

  // ✅ 정렬 필터 변경 핸들러
  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);

    // URL 파라미터 업데이트
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("sortBy", newSortBy);
    setSearchParams(newSearchParams);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/no-image.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/product_images/${imagePath}`;
  };

  return (
    <div className="goldSilver-page">
      {/* ✅ 상단 필터 바 추가 */}
      <div className="goldSilver-filter-bar">
        <h2 className="goldSilver-title">
          {materialType === "골드" ? "골드 제품" : "실버 제품"}
        </h2>
        <select className="goldSilver-sort-dropdown" value={sortBy} onChange={handleSortChange}>
          <option value="">정렬 기준</option>
          <option value="rating">별점 높은 순</option>
          <option value="reviewCount">리뷰 많은 순</option>
          <option value="priceAsc">가격 낮은 순</option>
          <option value="priceDesc">가격 높은 순</option>
        </select>
      </div>

      {isLoading ? (
        <div className="goldSilver-loading-container">
          <LoadingScreen onCancel={() => setIsLoading(false)} />
        </div>
      ) : (
        <div className="goldSilver-list">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                className="goldSilver-card"
                key={product.productSeq}
                onClick={() => navigate(`/producDetail/${product.productSeq}`)}
              >
                <div className="goldSilver-image">
                  <img src={getImageUrl(product.productImage)} alt={product.productName} />
                </div>

                <div className="goldSilver-details">
                  <div className="goldSilver-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={`star ${index < Math.round(product.averageRating) ? "full" : "empty"}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="goldSilver-review-count">({product.reviewCount})</span>
                  </div>
                  <h4>{product.productName}</h4>
                  <p className="goldSilver-price">
                    {product.productSalePrice.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="goldSilver-no-results">해당 재질의 제품이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GoldSilverPage;
