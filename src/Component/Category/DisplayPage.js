import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import ProductSidebar from "../ProductSidebar";
import LoadingScreen from "../LoadingScreen";
import "./DisplayPage.css";
import { FaTimes } from "react-icons/fa";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector } from "react-redux";

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

const DisplayPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [itemList, setItemList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("전체");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [prevCategory, setPrevCategory] = useState(category); // ✅ 이전 카테고리 저장
  const [likeList, setLikeList] = useState([]); // ✅ 찜한 상품 목록

  const loginUser = useSelector((state) => state.user);

  const categoryData = categoryConfig[category];

  // ✅ 기존 데이터와 S3 데이터를 구분하여 이미지 표시
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/no-image.png"; // 기본 이미지 처리

    // ✅ S3 URL인지 확인
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // ✅ 기존 로컬 서버 이미지 경로를 S3 URL로 변경
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/product_images/${imagePath}`;
  };

  // ✅ 로그인한 사용자의 찜 목록 불러오기
  useEffect(() => {
    if (loginUser && loginUser.memberId) {
      axios
        .get(`/api/post/getUserLikes`, {
          params: { memberId: loginUser.memberId },
        })
        .then((response) => {
          setLikeList(response.data.map((item) => item.productSeq));
        })
        .catch((error) => console.error("좋아요 목록 불러오기 오류:", error));
    }
  }, [loginUser]);

  useEffect(() => {
    setIsLoading(true);
    const searchParams = new URLSearchParams(location.search);
    const subCategoryFromURL = searchParams.get("subCategory") || "전체";
    setSelectedSubCategory(subCategoryFromURL);

    if (categoryData?.id) {
      axios
        .get("/api/product/categoryList", {
          params: {
            categoryId: categoryData.id,
            subCategory:
              subCategoryFromURL !== "전체" ? subCategoryFromURL : undefined, // ✅ "전체"이면 필터링 없이 가져오기
          },
        })
        .then((result) => {
          const products = result.data || [];
          const productPromises = products.map((product) =>
            axios
              .get(`/api/review/getReview`, {
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
          return Promise.all(productPromises);
        })
        .then((updatedProducts) => {
          setItemList(updatedProducts);
          setFilteredItems(updatedProducts);
        })
        .finally(() => {
          setTimeout(() => setIsLoading(false), 100);
        });
    } else {
      setIsLoading(false);
    }
  }, [location.search, category]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newSortBy = searchParams.get("sortBy") || "";

    // ✅ minPrice=0도 올바르게 인식되도록 수정
    const minPrice = searchParams.get("minPrice") !== null ? Number(searchParams.get("minPrice")) : 0;
    const maxPrice = searchParams.get("maxPrice") !== null ? Number(searchParams.get("maxPrice")) : Infinity;

    setSortBy(newSortBy);
  
    if (itemList.length === 0) return;
  
    let updatedItems = [...itemList];
  

  // ✅ 가격 필터 적용 (최소값이 0원 이상, 최대값이 지정된 경우)
  updatedItems = updatedItems.filter(
    (item) =>
      item.productSalePrice >= minPrice && item.productSalePrice <= maxPrice
  );
  
    // ✅ 정렬 적용
    if (newSortBy === "rating") {
      updatedItems.sort((a, b) => b.averageRating - a.averageRating);
    } else if (newSortBy === "reviewCount") {
      updatedItems.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (newSortBy === "priceAsc") {
      updatedItems.sort((a, b) => a.productSalePrice - b.productSalePrice);
    } else if (newSortBy === "priceDesc") {
      updatedItems.sort((a, b) => b.productSalePrice - a.productSalePrice);
    }
  
    setFilteredItems(updatedItems);
  }, [location.search, itemList]);
  

  // ⭐ 정렬 변경 시 `searchParams` 반영
  const handleSortChange = (event) => {
    const sortOption = event.target.value;
    setSortBy(sortOption);

    const searchParams = new URLSearchParams(location.search);
    searchParams.set("sortBy", sortOption);
    navigate(`/${category}?${searchParams.toString()}`);
  };

  const removeFilter = (filterKey) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete(filterKey); // 해당 필터 삭제
    navigate(`/${category}?${newSearchParams.toString()}`);
  };

  // ✅ 찜(좋아요) 추가/취소 기능
  const toggleLike = async (productSeq) => {
    if (!loginUser || !loginUser.memberId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      if (likeList.includes(productSeq)) {
        // ✅ 좋아요 취소
        await axios.delete(`/api/post/removeLike`, {
          params: {
            memberId: loginUser.memberId,
            productSeq: productSeq,
          },
        });
        setLikeList(likeList.filter((id) => id !== productSeq));
      } else {
        // ✅ 좋아요 추가
        await axios.post(`/api/post/addLike`, {
          memberId: loginUser.memberId,
          productSeq: productSeq,
        });
        setLikeList([...likeList, productSeq]);
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
    }
  };

  return (
    <div className="display-wrapper">
      {/* ✅ 이전 카테고리를 저장하도록 `setPrevCategory` 전달 */}
      <ProductSidebar setPrevCategory={setPrevCategory} />

      <div className="display-container">
        {isLoading ? (
          <LoadingScreen
            onCancel={() => {
              if (prevCategory) {
                navigate(`/${prevCategory}`); // ✅ 취소 시 이전 카테고리로 복귀
              }
              setIsLoading(false);
            }}
          />
        ) : (
          <>
            <div className="display-sub-category-container">
              <h2 className="display-sub-category-title">
                {categoryData?.name} 목록
              </h2>
            </div>

            <div className="display-filter-box">
              {/* <h3 className="display-filter-title">선택된 필터:</h3> */}
              {/* ✅ 카테고리 필터 */}
              <div className="display-filter-item">
                <span className="display-filter-label">카테고리:</span>
                {categoryData?.name}{" "}
                {selectedSubCategory !== "전체" && ` > ${selectedSubCategory}`}
                <FaTimes
                  className="filter-remove-icon"
                  onClick={() => removeFilter("subCategory")}
                />
              </div>

              {/* ✅ 가격 필터 */}
              {searchParams.get("minPrice") && searchParams.get("maxPrice") && (
                <div className="display-filter-item">
                  <span className="display-filter-label">가격:</span>
                  {parseInt(searchParams.get("minPrice")).toLocaleString()}원 ~{" "}
                  {parseInt(searchParams.get("maxPrice")).toLocaleString()}원
                  <FaTimes
                    className="filter-remove-icon"
                    onClick={() => {
                      removeFilter("minPrice");
                      removeFilter("maxPrice");
                    }}
                  />
                </div>
              )}

              {/* ✅ 정렬 필터 */}
              {sortBy && (
                <div className="display-filter-item">
                  <span className="display-filter-label">정렬:</span>{" "}
                  {(() => {
                    switch (sortBy) {
                      case "rating":
                        return "별점 높은 순";
                      case "reviewCount":
                        return "리뷰 많은 순";
                      case "priceAsc":
                        return "가격 낮은 순";
                      case "priceDesc":
                        return "가격 높은 순";
                      default:
                        return "";
                    }
                  })()}
                  <FaTimes
                    className="filter-remove-icon"
                    onClick={() => removeFilter("sortBy")}
                  />
                </div>
              )}
            </div>

            <div className="display-product-list">
              {filteredItems.length > 0 ? (
                filteredItems.map((product) => (
                  <div
                    className="display-product-card"
                    key={product.productSeq}
                    onClick={() =>
                      navigate(`/producDetail/${product.productSeq}`)
                    }
                  >
                    <div className="display-image">
                      <img
                        src={getImageUrl(product.productImage)}
                        // src={`http://localhost:8070/product_images/${product.productImage}`}
                        alt={product.productName}
                      />
                    </div>

                    <div className="display-details">
                      <div className="display-rating">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={index}
                            className={`star ${
                              index < Math.round(product.averageRating)
                                ? "full"
                                : "empty"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="review-count">
                          ({product.reviewCount})
                        </span>

                        {/* ✅ 리뷰 개수 오른편에 찜(하트) 버튼 추가 */}
                        <span
                          className="display-like-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(product.productSeq);
                          }}
                        >
                          {likeList.includes(product.productSeq) ? (
                            <FaHeart className="display-liked" />
                          ) : (
                            <FaRegHeart className="display-unliked" />
                          )}
                        </span>
                      </div>
                      <h4>{product.productName}</h4>
                      <p className="display-price">
                        <span className="sale-price">
                          {product.productSalePrice.toLocaleString()}원
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>상품이 없습니다.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DisplayPage;
