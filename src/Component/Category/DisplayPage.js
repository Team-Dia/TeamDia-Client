import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import './DisplayPage.css';

const categoryConfig = {
    ring: { id: 1, subCategories: ["전체", "커플링", "심플", "큐빅", "골드", "실버"] },
    necklace: { id: 2, subCategories: ["전체", "일체형", "메달형", "펜던트", "골드", "실버"] },
    earRing: { id: 3, subCategories: ["전체", "피어싱", "원터치", "롱", "골드", "실버"] },
    bracelet: { id: 4, subCategories: ["전체", "체인", "가죽", "큐빅", "골드", "실버"] }
};

const DisplayPage = () => {
    const { category } = useParams();  // URL에서 카테고리명 가져오기
    const navigate = useNavigate();
    const location = useLocation();
    
    const categoryData = categoryConfig[category] || {};
    const [itemList, setItemList] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState("전체");
    const [sortByRating, setSortByRating] = useState(false);
    const [sortBy, setSortBy] = useState("");

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const subCategoryFromURL = searchParams.get("subCategory") || "전체";
        setSelectedSubCategory(subCategoryFromURL);

        if (categoryData.id) {
            axios.get("/api/product/categoryList", {
                params: { 
                    categoryId: categoryData.id,
                    subCategory: subCategoryFromURL !== "전체" ? subCategoryFromURL : undefined
                }
            })
            .then((result) => {
                const products = result.data || [];
                
                // ⭐ 각 상품의 리뷰 평균 점수 가져오기
                const productPromises = products.map(product =>
                    axios.get(`/api/review/getReview`, { params: { productSeq: product.productSeq } })
                        .then(res => ({
                            ...product,
                            averageRating: res.data.averageRating || 0, // 기본값 0
                            reviewCount: res.data.reviewCount || 0 // 기본값 0
                        }))
                        .catch(() => ({
                            ...product,
                            averageRating: 0,
                            reviewCount: 0
                        }))
                );

                Promise.all(productPromises).then(updatedProducts => {
                    setItemList(updatedProducts);
                    setFilteredItems(updatedProducts);
                });
            })
            .catch(() => {
                setItemList([]);
                setFilteredItems([]);
            });
        }
    }, [location.search, category]);  // category 변경될 때마다 실행

    // ⭐ 정렬 함수
    const handleSortChange = (event) => {
        const sortOption = event.target.value;
        setSortBy(sortOption);

        let sortedItems = [...filteredItems];

        if (sortOption === "rating") {
            sortedItems.sort((a, b) => b.averageRating - a.averageRating);
        } else if (sortOption === "reviewCount") {
            sortedItems.sort((a, b) => b.reviewCount - a.reviewCount);
        } else if (sortOption === "priceAsc") {
            sortedItems.sort((a, b) => a.productSalePrice - b.productSalePrice);
        } else if (sortOption === "priceDesc") {
            sortedItems.sort((a, b) => b.productSalePrice - a.productSalePrice);
        }

        setFilteredItems(sortedItems);
    };

    const handleSubCategoryClick = (subCategory) => {
        setSelectedSubCategory(subCategory);
        navigate(`/${category}?subCategory=${encodeURIComponent(subCategory)}`);
    };

    return (
        <article>
            <div className="display-sub-category-container">
                <div className="display-sub-category-buttons">
                    {categoryData.subCategories?.map((subCategory) => (
                        <button
                            key={subCategory}
                            className={selectedSubCategory === subCategory ? "active" : ""}
                            onClick={() => handleSubCategoryClick(subCategory)}
                        >
                            {subCategory}
                        </button>
                    ))}
                </div>
                {/* ⭐ 정렬 기준 선택 드롭다운 추가 */}
                <select className="sort-dropdown" value={sortBy} onChange={handleSortChange}>
                    <option value="">정렬 기준</option>
                    <option value="rating">별점 높은 순</option>
                    <option value="reviewCount">리뷰 많은 순</option>
                    <option value="priceAsc">가격 낮은 순</option>
                    <option value="priceDesc">가격 높은 순</option>
                </select>
            </div>

            <div className="display-container">
                <div className="display-product-list">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((product) => (
                            <div 
                                className="display-product-card" 
                                key={product.productSeq} 
                                onClick={() => navigate(`/producDetail/${product.productSeq}`)}
                            >
                                <div className="display-image">
                                    <img src={`http://localhost:8070/product_images/${product.productImage}`} alt={product.productName} />
                                </div>
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
                        ))
                    ) : (
                        <p>상품이 없습니다.</p>
                    )}
                </div>
            </div>
        </article>
    );
};

export default DisplayPage;
