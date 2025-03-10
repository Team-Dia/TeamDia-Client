import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../style/ProductSidebar.css";

const categoryConfig = {
  ring: {
    id: 1,
    name: "반지",
    subCategories: ["전체", "커플링", "심플", "큐빅", "골드", "실버"],
  },
  necklace: {
    id: 2,
    name: "목걸이",
    subCategories: ["전체", "일체형", "메달형", "펜던트", "골드", "실버"],
  },
  earRing: {
    id: 3,
    name: "귀걸이",
    subCategories: ["전체", "피어싱", "원터치", "롱", "골드", "실버"],
  },
  bracelet: {
    id: 4,
    name: "팔찌",
    subCategories: ["전체", "체인", "가죽", "큐빅", "골드", "실버"],
  },
};

const priceOptions = [
  { label: "전체", value: "all" },
  { label: "5만 원 이하", value: "0-50000" },
  { label: "5만 원 ~ 10만 원", value: "50000-100000" },
  { label: "10만 원 ~ 20만 원", value: "100000-200000" },
  { label: "20만 원 ~ 30만 원", value: "200000-300000" },
  { label: "30만 원 이상", value: "300000-1000000" },
  { label: "직접 입력", value: "custom" },
];

const sortOptions = [
  { label: "정렬 기준", value: "" },
  { label: "별점 높은 순", value: "rating" },
  { label: "리뷰 많은 순", value: "reviewCount" },
  { label: "가격 낮은 순", value: "priceAsc" },
  { label: "가격 높은 순", value: "priceDesc" },
];

const ProductSidebar = ({ setPrevCategory }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "ring"
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    searchParams.get("subCategory") || "전체"
  );
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [customPrice, setCustomPrice] = useState([10000, 1000000]);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  const handleCategoryClick = (category) => {
    setPrevCategory(selectedCategory);
    setSelectedCategory(category);
    setSelectedSubCategory("전체"); // ✅ 기본값을 "전체"로 설정
    navigate(`/${category}?subCategory=${encodeURIComponent("전체")}`); // ✅ URL에도 반영
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    navigate(
      `/${selectedCategory}?subCategory=${encodeURIComponent(subCategory)}`
    );
  };

  const handleApplyFilter = () => {
    const filterParams = {
      category: selectedCategory,
      subCategory: selectedSubCategory,
    };
  
    if (selectedPrice !== "all") {
      if (selectedPrice === "custom") {
        filterParams.minPrice = customPrice[0] ?? 0; // ✅ 0도 포함
        filterParams.maxPrice = customPrice[1] ?? Infinity;
      } else {
        const [min, max] = selectedPrice.split("-").map(Number);
        filterParams.minPrice = min ?? 0; // ✅ 0을 제외하지 않음
        filterParams.maxPrice = max ?? Infinity;
      }
    }
  
    if (sortBy) filterParams.sortBy = sortBy;
  
    setSearchParams(filterParams);
  };
  

  const handleResetFilter = () => {
    setSelectedCategory("ring");
    setSelectedSubCategory("전체");
    setSelectedPrice("all");
    setCustomPrice([10000, 1000000]);
    setSortBy("");
    setSearchParams({});
  };

  return (
    <aside className="product-sidebar">
      <h3 className="sidebar-title">카테고리</h3>
      <ul className="category-list">
        {Object.keys(categoryConfig).map((category) => (
          <li key={category}>
            <button
              className={`category-button ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {categoryConfig[category].name}
            </button>
          </li>
        ))}
      </ul>

      <h3 className="sidebar-title">세부 카테고리</h3>
      <ul className="sub-category-list">
        {categoryConfig[selectedCategory]?.subCategories.map((subCategory) => (
          <li key={subCategory}>
            <button
              className={`sub-category-button ${
                selectedSubCategory === subCategory ? "active" : ""
              }`}
              onClick={() => handleSubCategoryClick(subCategory)}
            >
              {subCategory}
            </button>
          </li>
        ))}
      </ul>

      <div className="filter-section">
        <h4>가격</h4>
        <div className="price-options">
          {priceOptions.map((option) => (
            <label key={option.value} className="price-label">
              <input
                type="radio"
                name="price"
                value={option.value}
                checked={selectedPrice === option.value}
                onChange={() => setSelectedPrice(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>

        {selectedPrice === "custom" && (
          <div className="price-inputs">
            <input
              type="number"
              value={customPrice[0]}
              onChange={(e) =>
                setCustomPrice([+e.target.value || 0, customPrice[1]])
              }
            />
            <span>~</span>
            <input
              type="number"
              value={customPrice[1]}
              onChange={(e) =>
                setCustomPrice([customPrice[0], +e.target.value || 0])
              }
            />
          </div>
        )}
      </div>

      <div className="filter-section">
        <h4>정렬 기준</h4>
        <select
          className="sort-dropdown"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-buttons">
        <button className="reset-button" onClick={handleResetFilter}>
          초기화
        </button>
        <button className="apply-button" onClick={handleApplyFilter}>
          적용
        </button>
      </div>
    </aside>
  );
};

export default ProductSidebar;
