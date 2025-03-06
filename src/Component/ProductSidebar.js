import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../style/ProductSidebar.css"; // ✅ 사이드바 스타일 적용

const categoryConfig = {
    ring: { id: 1, name: "반지", subCategories: ["전체", "커플링", "심플", "큐빅", "골드", "실버"] },
    necklace: { id: 2, name: "목걸이", subCategories: ["전체", "일체형", "메달형", "펜던트", "골드", "실버"] },
    earRing: { id: 3, name: "귀걸이", subCategories: ["전체", "피어싱", "원터치", "롱", "골드", "실버"] },
    bracelet: { id: 4, name: "팔찌", subCategories: ["전체", "체인", "가죽", "큐빅", "골드", "실버"] }
};

const ProductSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "ring");
    const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get("subCategory") || "전체");
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [customPrice, setCustomPrice] = useState([10000, 1000000]);
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedSubCategory("전체");
        navigate(`/${category}?subCategory=전체`);
    };

    const handleSubCategoryClick = (subCategory) => {
        setSelectedSubCategory(subCategory);
        navigate(`/${selectedCategory}?subCategory=${encodeURIComponent(subCategory)}`);
    };

    const handleApplyFilter = () => {
        const keyword = searchParams.get("keyword") || "";
        const filterParams = { keyword, category: selectedCategory, subCategory: selectedSubCategory };

        if (selectedPrice !== "all") {
            if (selectedPrice === "custom") {
                filterParams.minPrice = customPrice[0] || null;
                filterParams.maxPrice = customPrice[1] || null;
            } else {
                const [min, max] = selectedPrice.split("-").map(Number);
                filterParams.minPrice = min || null;
                filterParams.maxPrice = max || null;
            }
        }

        if (sortBy) filterParams.sortBy = sortBy;

        setSearchParams(filterParams); // ✅ 카테고리 및 필터 적용
    };

    return (
<aside className="product-sidebar">
            <h3>카테고리</h3>
            <div className="category-list">
                {Object.keys(categoryConfig).map((category) => (
                    <button
                        key={category}
                        className={`category-button ${selectedCategory === category ? "active" : ""}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {categoryConfig[category].name}
                    </button>
                ))}
            </div>

            {/* ✅ 서브카테고리 필터 */}
            <div className="filter-section">
                <h4>세부 카테고리</h4>
                <div className="sub-category-list">
                    {categoryConfig[selectedCategory]?.subCategories.map((subCategory) => (
                        <button
                            key={subCategory}
                            className={`sub-category-button ${selectedSubCategory === subCategory ? "active" : ""}`}
                            onClick={() => handleSubCategoryClick(subCategory)}
                        >
                            {subCategory}
                        </button>
                    ))}
                </div>
            </div>

            {/* ✅ 가격 필터 */}
            <div className="filter-section">
                <h4>가격</h4>
                <select className="sort-dropdown" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)}>
                    <option value="all">전체</option>
                    <option value="0-50000">5만 원 이하</option>
                    <option value="50000-100000">5만 원 ~ 10만 원</option>
                    <option value="100000-200000">10만 원 ~ 20만 원</option>
                    <option value="200000-300000">20만 원 ~ 30만 원</option>
                    <option value="300000-1000000">30만 원 이상</option>
                    <option value="custom">직접 입력</option>
                </select>

                {selectedPrice === "custom" && (
                    <div className="price-inputs">
                        <input type="number" value={customPrice[0]} onChange={e => setCustomPrice([+e.target.value || 0, customPrice[1]])} />
                        <span>~</span>
                        <input type="number" value={customPrice[1]} onChange={e => setCustomPrice([customPrice[0], +e.target.value || 0])} />
                    </div>
                )}
            </div>
            {/* ✅ 정렬 필터 */}
            <div className="filter-section">
                <h4>정렬 기준</h4>
                <select className="sort-dropdown" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">정렬 기준</option>
                    <option value="rating">별점 높은 순</option>
                    <option value="reviewCount">리뷰 많은 순</option>
                    <option value="priceAsc">가격 낮은 순</option>
                    <option value="priceDesc">가격 높은 순</option>
                </select>
            </div>

            <button onClick={handleApplyFilter}>적용</button>
        </aside>
    );
};

export default ProductSidebar;
