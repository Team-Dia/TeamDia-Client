import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Sidebar from "./Sidebar"; // 사이드바 추가
import ProfileCard from "./ProfileCard"; // 프로필 카드 추가
import defaultPlaceholder from "../../Component/image/default-placeholder.jpg"; // ✅ 기본 이미지 적용
import "./RecentlyViewed.css"; // 스타일 적용

const RecentlyViewedPage = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(
    localStorage.getItem("nickname") || ""
  );

  useEffect(() => {
    const storedProducts =
      JSON.parse(localStorage.getItem("viewedProducts")) || [];
    console.log("✅ 전체 최근 본 상품 로드됨:", storedProducts); // 디버깅 로그 추가
    setRecentProducts(storedProducts);
  }, []);

  // ✅ 기존 데이터와 S3 데이터를 구분하여 이미지 표시
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultPlaceholder; // 기본 이미지 처리
    // S3 URL인지 확인
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // 기존 로컬 서버 이미지 경로를 S3 URL로 변경
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/product_images/${imagePath}`;
  };

  // 개별 상품 삭제
  const removeItem = (productSeq) => {
    const updatedProducts = recentProducts.filter(
      (product) => product.productSeq !== productSeq
    );
    setRecentProducts(updatedProducts);
    localStorage.setItem("viewedProducts", JSON.stringify(updatedProducts));
  };

  // 전체 삭제
  const clearAll = () => {
    setRecentProducts([]);
    localStorage.removeItem("viewedProducts");
  };

  return (
    <div className="mypage-container">
      <div className="mypage-box">
        <Sidebar /> {/* ✅ 사이드바 추가 */}
        <div className="mypage-content">
          <ProfileCard nickname={nickname} /> {/* ✅ 프로필 카드 추가 */}
          <div className="points-section">
            <h2>최근 본 상품 목록</h2>
            <div className="recentview">
              {recentProducts.length > 0 ? (
                <>
                  <div className="recently-viewed-list">
                    {recentProducts.map((product, index) => {
                      console.log("📌 개별 상품 정보:", product); // 🔹 각 상품이 올바르게 로드되는지 확인
                      // const imageUrl = product.productImage
                      //   ? `http://localhost:8070/product_images/${product.productImage}`
                      //   : defaultPlaceholder;

                      return (
                        <div key={index} className="recently-viewed-item">
                          <button
                            className="remove-btn"
                            onClick={() => removeItem(product.productSeq)}
                          >
                            <FaTrash />
                          </button>
                          <img
                            src={getImageUrl(product.productImage)} // 🔹 수정됨: S3 URL 적용
                            // src={imageUrl}
                            alt={product.productName || "상품명 없음"}
                            className="recently-viewed-img"
                            onClick={() =>
                              navigate(`/producDetail/${product.productSeq}`)
                            }
                          />
                          <div className="recently-viewed-info">
                            <p className="recently-viewed-name">
                              {product.productName}
                            </p>
                            <p className="recently-viewed-price">
                              {product.productPrice.toLocaleString()}원
                            </p>
                          </div>
                          {/* 개별 삭제 버튼 */}
                          {/* <button className="remove-btn" onClick={() => removeItem(product.productSeq)}>
                                                삭제
                                            </button> */}
                        </div>
                      );
                    })}
                  </div>

                  {/* 전체 삭제 버튼 */}
                  <button className="clear-btn" onClick={clearAll}>
                    전체 삭제
                  </button>
                </>
              ) : (
                <p>최근 본 상품이 없습니다.</p>
              )}

              <button
                className="view-more-btn"
                onClick={() => navigate("/mypage")}
              >
                마이페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedPage;
