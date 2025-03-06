import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import ProductSidebar from "../ProductSidebar";
import './DisplayPage.css';

// ✅ 카테고리 ID 및 서브 카테고리 설정
const categoryConfig = {
    ring: { id: 1, name: "반지", subCategories: ["전체", "커플링", "심플", "큐빅", "골드", "실버"] },
    necklace: { id: 2, name: "목걸이", subCategories: ["전체", "일체형", "메달형", "펜던트", "골드", "실버"] },
    earRing: { id: 3, name: "귀걸이", subCategories: ["전체", "피어싱", "원터치", "롱", "골드", "실버"] },
    bracelet: { id: 4, name: "팔찌", subCategories: ["전체", "체인", "가죽", "큐빅", "골드", "실버"] }
};

const DisplayPage = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const categoryData = categoryConfig[category] || { id: null, subCategories: [] };

    const [itemList, setItemList] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState("전체");
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
                            averageRating: res.data.averageRating || 0,
                            reviewCount: res.data.reviewCount || 0
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
    }, [location.search, category]);

    // ⭐ 정렬 변경 시 `searchParams` 반영
    const handleSortChange = (event) => {
        const sortOption = event.target.value;
        setSortBy(sortOption);

        const searchParams = new URLSearchParams(location.search);
        searchParams.set("sortBy", sortOption);
        navigate(`/${category}?${searchParams.toString()}`);

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

    return (
        <article className="display-container">
            <ProductSidebar category={category} /> {/* ✅ 사이드바에 `category` 전달 */}

            <div className="display-content">
                <div className="display-sub-category-container">
                    <h2 className="display-sub-category-title">{categoryData.name} 목록</h2>
                </div>

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
