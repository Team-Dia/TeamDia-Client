import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchItem from "./SearchItem";
import ProductSidebar from "../ProductSidebar";
import LoadingScreen from "../LoadingScreen";
import "./SearchResults.css";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);  // 원본 상품 데이터
    const [filteredProducts, setFilteredProducts] = useState([]);  // 정렬된 상품 데이터
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ 검색어 및 정렬 값 가져오기
    const keyword = searchParams.get("keyword") || "";
    const sortBy = searchParams.get("sortBy") || "";

    useEffect(() => {
        if (!keyword) return;

        setIsLoading(true); // ✅ 데이터 요청 시작 시 로딩 표시

        axios.get(`/api/product/search`, { params: { keyword } })
            .then(async (response) => {
                const productList = response.data || [];

                const productPromises = productList.map(product =>
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

                const updatedProducts = await Promise.all(productPromises);
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);  // ✅ 초기에는 원본 데이터를 그대로 사용
            })
            .catch((error) => {
                console.error("❌ 검색 실패:", error);
                setProducts([]);
                setFilteredProducts([]);
            })
            .finally(() => {
                setIsLoading(false); // ✅ 모든 요청이 완료되거나 실패하면 로딩 종료
            });

    }, [keyword]);

    // ✅ 정렬 기능 적용
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

        setFilteredProducts(sortedItems);  // ✅ 정렬된 데이터 업데이트
    }, [sortBy, products]); 

    return (
        <div className="display-wrapper">
            <ProductSidebar /> {/* ✅ 기존 사이드바 유지 (필터 적용 가능) */}

            <div className="display-container">
                {isLoading && <LoadingScreen />} {/* ✅ 로딩 화면 */}

                <div className="display-sub-category-container">
                    <h2 className="display-sub-category-title">🔍 "{keyword}" 검색 결과</h2>
                </div>

                {/* ✅ 상품 리스트 출력 */}
                <div className="display-product-list">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <SearchItem key={product.productSeq} product={product} />
                        ))
                    ) : (
                        <p className="no-results-message">🔍 해당되는 상품이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
