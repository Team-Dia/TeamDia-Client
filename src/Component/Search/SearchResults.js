import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchItem from "./SearchItem"; // ✅ 개별 검색 아이템
import ProductSidebar from "../ProductSidebar"; // ✅ 사이드바 필터 유지
import "../Category/DisplayPage.css"; // ✅ `DisplayPage.css` 스타일 유지

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const user = useSelector(state => state.user);

    // ✅ 검색어, 가격 필터, 정렬 값 가져오기
    const keyword = searchParams.get("keyword") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy");

    useEffect(() => {
        if (!keyword) return; // 검색어가 없으면 요청하지 않음

        // ✅ 검색 API 호출 (빈 값 제거)
        const params = { keyword };
        if (minPrice && minPrice !== "null") params.minPrice = minPrice;
        if (maxPrice && maxPrice !== "null") params.maxPrice = maxPrice;
        if (sortBy) params.sortBy = sortBy;

        console.log(`📡 검색 요청: keyword=${keyword}, minPrice=${minPrice}, maxPrice=${maxPrice}, sortBy=${sortBy}`);

        axios.get(`/api/product/search`, { params })
            .then(async (response) => {
                const productList = response.data || [];

                // ⭐ 각 상품의 별점 및 리뷰 개수 가져오기
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
                console.log("✅ 별점 및 리뷰 포함된 최종 상품 리스트:", updatedProducts);
            })
            .catch((error) => {
                console.error("❌ 검색 실패:", error);
                setProducts([]);
            });
    }, [searchParams]); // ✅ `searchParams`가 변경될 때마다 실행

    return (
        <article>
            <div className="display-sub-category-container">
                <h2 className="display-sub-category-title">🔍 "{keyword}" 검색 결과</h2>
            </div>
            <div className="display-box"></div>
            {/* <div className="display-container"> */}
                <ProductSidebar /> {/* ✅ 기존 사이드바 유지 (가격 필터 포함) */}
                <div className="display-container">
                <div className="display-product-list">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <SearchItem key={product.productSeq} product={product} />
                        ))
                    ) : (
                        <p className="no-results-message">🔍 해당되는 상품이 없습니다.</p>
                    )}
                </div>
            </div>
        </article>
    );
};

export default SearchResults;
