import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux"; // ✅ Redux에서 로그인 상태 가져오기
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchItem from "./SearchItem"; // ✅ 검색된 상품을 보여줄 공통 컴포넌트
import "./SearchResults.css"; // ✅ 스타일 적용

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || ""; // ✅ 최신 URL에서 검색어 가져오기
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const user = useSelector(state => state.user); // ✅ 로그인된 사용자 정보 가져오기

    // ✅ 추가: 가격 범위 상태 관리
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || ""); // ✅ 최신 URL에서 가져온 가격 필터 적용
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

    useEffect(() => {
        if (keyword) {
            sessionStorage.setItem("searchKeyword", keyword);
            const encodedKeyword = encodeURIComponent(keyword);
            const memberIdParam = user?.memberId ? `&memberId=${user.memberId}` : "";
            
            const priceParams = (minPrice && maxPrice) ? `&minPrice=${minPrice}&maxPrice=${maxPrice}` : "";

            console.log(`📡 검색 요청: keyword=${keyword}, minPrice=${minPrice}, maxPrice=${maxPrice}, memberId=${user?.memberId || "없음"}`);

            axios.get(`/api/product/search?keyword=${encodedKeyword}${memberIdParam}${priceParams}`)
                .then((response) => {
                    if (response.data.length === 0) {
                        console.log("❌ 검색 결과 없음");
                        setProducts([]); 
                    } else {
                        console.log("✅ 검색 결과 응답:", response.data);
                        setProducts(response.data);
                    }
                })
                .catch((error) => {
                    console.error("❌ 검색 실패:", error);
                    setProducts([]); 
                });
        }
    }, [keyword, minPrice, maxPrice, user?.memberId]);

    return (
        <article>
            <h2 className="search-results-title">🔍 "{keyword}" 검색 결과</h2>

             {/* ✅ 가격 필터링 UI 추가 */}
            <div className="price-filter">
                <label>가격 범위:</label>
                <input 
                    type="number" 
                    placeholder="최소 가격" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value)} 
                />
                <span>~</span>
                <input 
                    type="number" 
                    placeholder="최대 가격" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)} 
                />
                <button
                onClick={() => {
                    const newParams = new URLSearchParams();
                    newParams.set("keyword", keyword); // ✅ 키워드 유지
                    if (minPrice !== "" && minPrice !== null) newParams.set("minPrice", minPrice);
                    if (maxPrice !== "" && maxPrice !== null) newParams.set("maxPrice", maxPrice);
                    setSearchParams(newParams); // ✅ URL 업데이트
                    console.log("📡 [DEBUG] URL 업데이트: ", newParams.toString()); // ✅ 디버깅용 로그 추가
                }}
                >
                적용
                </button>

                {/* ✅ 적용 취소 버튼 */}
                <button
                    onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                        const newParams = new URLSearchParams();
                        newParams.set("keyword", keyword); // ✅ 키워드는 유지
                        newParams.delete("minPrice");
                        newParams.delete("maxPrice");
                        setSearchParams(newParams);
                        console.log("🛑 [DEBUG] 가격 필터링 취소");
                    }}
                >
                    적용 취소
                </button>
            </div>

            <div className="search-container">
                <div className="searchProduct-list">
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