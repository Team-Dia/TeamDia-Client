import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import '../../style/NecklacePage.css';

const BraceletPage = () => {
    const [itemList, setItemList] = useState([]); // 전체 제품 목록
    const [filteredItems, setFilteredItems] = useState([]); // 필터링된 제품 목록
    const [selectedSubCategory, setSelectedSubCategory] = useState("전체"); // 선택된 세부 카테고리
    const navigate = useNavigate();
    const location = useLocation();

    // 🔹 URL에서 subCategory 값 가져오기
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const subCategoryFromURL = searchParams.get("subCategory") || "전체";

        setSelectedSubCategory(subCategoryFromURL);

        // 🔹 API 요청 시 subCategory 값 반영
        axios.get("/api/product/categoryList", {
            params: { 
                categoryId: 4,
                subCategory: subCategoryFromURL !== "전체" ? subCategoryFromURL : undefined
            }
        })
        .then((result) => {
            setItemList(result.data || []);
            setFilteredItems(result.data || []);
        })
        .catch(() => {
            setItemList([]);
            setFilteredItems([]);
        });
    }, [location.search]); // location.search 변경될 때마다 실행

    // 🔹 세부 카테고리 필터링 (URL 변경)
    const handleSubCategoryClick = (subCategory) => {
        setSelectedSubCategory(subCategory);
        navigate(`/bracelet?subCategory=${encodeURIComponent(subCategory)}`); // URL 변경 -> useEffect가 실행됨
    };

    return (
        <article>
            <div className="sub-category-container">
                <div className="sub-category-buttons">
                    {["전체", "체인", "가죽", "큐빅", "골드", "실버"].map((subCategory) => (
                        <button
                            key={subCategory}
                            className={selectedSubCategory === subCategory ? "active" : ""}
                            onClick={() => handleSubCategoryClick(subCategory)}
                        >
                            {subCategory}
                        </button>
                    ))}
                </div>
            </div>

            <div className="necklace-container">
                <div className="product-list">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((product) => (
                            <div 
                                className="product-card" 
                                key={product.productSeq} 
                                onClick={() => navigate(`/producDetail/${product.productSeq}`)}
                            >
                                <div className="image">
                                    <img src={`http://localhost:8070/product_images/${product.productImage}`} alt={product.productName} />
                                </div>
                                <div className="details">
                                    <h4>{product.productName}</h4>
                                    <p className="price">
                                        {/* <span className="original-price">{product.productCostPrice.toLocaleString()}원</span> */}
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

export default BraceletPage;
