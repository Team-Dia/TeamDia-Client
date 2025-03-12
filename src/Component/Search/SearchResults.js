import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchItem from "./SearchItem";
import LoadingScreen from "../LoadingScreen";
import "./SearchResults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sortBy") || "";

  // ✅ 프록시를 사용하여 요청할 API 경로 설정
  const BASE_URL = "/api/product";
  const REVIEW_URL = "/api/review"; // ✅ 리뷰 API 경로

  // ✅ 리뷰 데이터를 불러오는 함수 (공통 사용)
  const fetchReviews = async (productList) => {
    const productPromises = productList.map((product) =>
      axios
        .get(`${REVIEW_URL}/getReview`, {
          params: { productSeq: product.productSeq },
        })
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

    return await Promise.all(productPromises);
  };

  // ✅ 카테고리 맵핑 (이름 → ID 변환)
  const categoryMap = {
    all: "all",
    ring: "1",
    necklace: "2",
    earring: "3",
    bracelet: "4",
  };

  useEffect(() => {
    if (!keyword) return;

    setIsLoading(true);

    let queryParams = { keyword };

    if (category !== "all") {
      const categoryMap = {
        all: null, // ✅ "전체"일 때 category를 null로 설정
        ring: "1",
        necklace: "2",
        earring: "3",
        bracelet: "4",
      };
      const categoryId = categoryMap[category];
      if (categoryId) {
        queryParams.category = categoryId; // ✅ 숫자로 변환
      }
    }

    console.log("📌 [DEBUG] API 요청 경로:", `${BASE_URL}/searchWithCategory`);
    console.log("📌 [DEBUG] 요청 파라미터:", queryParams);

    axios
      .get(`${BASE_URL}/searchWithCategory`, { params: queryParams }) // ✅ "전체"일 때 category 파라미터 제거
      .then(async (response) => {
        let productList = response.data || [];

        if (!Array.isArray(productList)) {
          console.error(
            "🚨 API 응답 오류: productList가 배열이 아님",
            productList
          );
          productList = [];
        }

        const updatedProducts = await fetchReviews(productList); // ✅ 리뷰 데이터 추가
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
      })
      .catch((error) => {
        console.error("❌ 카테고리 검색 API 요청 실패:", error);
        setProducts([]);
        setFilteredProducts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [category, keyword]); // ✅ keyword와 category가 변경될 때만 실행

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

    setFilteredProducts(sortedItems);
  }, [sortBy, products]);

  const handleFilterChange = (key, value) => {
    searchParams.set(key, value);
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="search-results-page">
      <div className="search-filter-bar">
        <select
          value={category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
        >
          <option value="all">전체</option>
          <option value="ring">반지</option>
          <option value="necklace">목걸이</option>
          <option value="earring">귀걸이</option>
          <option value="bracelet">팔찌</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
        >
          <option value="">정렬 기준</option>
          <option value="rating">별점 높은 순</option>
          <option value="reviewCount">리뷰 많은 순</option>
          <option value="priceAsc">가격 낮은 순</option>
          <option value="priceDesc">가격 높은 순</option>
        </select>
      </div>

     {/* 🔹 검색 결과를 감싸는 컨테이너 추가 */}
    <div className="search-results-container">
      {isLoading && <LoadingScreen />}
      
      {/* 🔹 검색 결과 제목을 별도 div로 감싸기 */}
      <div className="search-results-title-wrapper">
        <h2 className="search-results-title">🔍 "{keyword}" 검색 결과</h2>
      </div>

      <div className="searchProduct-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <SearchItem key={product.productSeq} product={product} />
          ))
        ) : (
          <p className="no-results-message">해당되는 상품이 없습니다.</p>
        )}
      </div>
    </div>
  </div>
);
};

export default SearchResults;
