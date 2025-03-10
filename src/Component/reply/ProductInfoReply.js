import React from "react";
import "./ProductInfoReply.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ProductInfoReply = ({ reply }) => {
  const [selectedTab, setSelectedTab] = useState("detail"); // 'detail'이 기본 선택된 상태

  // 탭 클릭 시 상태 업데이트
  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const [product, setProduct] = useState({});
  const [productImages, setProductImages] = useState([]); // 이미지 데이터를 저장할 상태
  const { productSeq } = useParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열기/닫기 상태
  const [sortOption, setSortOption] = useState("평점 높은순"); // 기본 정렬 기준

  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 정렬 기준 선택
  const handleSortOptionClick = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false); // 메뉴 닫기
  };

  useEffect(() => {
    axios
      .get(`/api/product/selectPro`, { params: { productSeq } })
      .then((result) => {
        console.log(result.data.productImages);
        setProductImages(result.data.productImages || []); // 서버에서 받은 데이터를 상태에 저장
      })
      .catch((err) => {
        console.error(err);
        setProductImages([]);
      });
  }, [productSeq]);

  const isReplyValid = Array.isArray(reply) && reply.length > 0;

  // ✅ 기존 데이터와 S3 데이터를 구분하여 이미지 표시
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-image.png"; // 기본 이미지 처리
    // S3 URL인지 확인
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // 기존 로컬 서버 이미지 경로를 S3 URL로 변경
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/product_images/${imagePath}`;
  };

  return (
    <div className="inforeply-container">
      <div className="inforeply-header">
        <div
          id="header-button"
          className={selectedTab === "detail" ? "active" : "inactive"}
          onClick={() => handleTabClick("detail")}
        >
          상세 정보
        </div>
        <div
          id="header-button"
          className={selectedTab === "review" ? "active" : "inactive"}
          onClick={() => handleTabClick("review")}
        >
          상품 후기
        </div>
      </div>

      <div className="info-product">
        {productImages.length > 0 ? (
          productImages.map((product, idx) => (
            <>
              {product.infoImage && (
                <img
                  src={getImageUrl(product.infoImage)} // S3 URL 적용
                  // src={`http://localhost:8070/product_infoimages/${product.infoImage}`}
                />
              )}

              {product.infoImage2 && (
                <img
                  src={getImageUrl(product.infoImage2)} // S3 URL 적용
                  // src={`http://localhost:8070/product_infoimages/${product.infoImage2}`}
                />
              )}
            </>
          ))
        ) : (
          <p>로딩 중...</p>
        )}
      </div>

      <div className="reply-photo">
        <p>후기 사진</p>
      </div>

      <div className="reply-img">
        {!isReplyValid ? (
          <p>리플라이 데이터가 없습니다.</p>
        ) : (
          reply.map(
            (replyItem, idx) =>
              replyItem.replyImage && (
                <img
                  key={idx}
                  src={getImageUrl(replyItem.replyImage)} // 🔹 수정됨: S3 URL 적용
                  // src={`http://localhost:8070/product_images/${replyItem.replyImage}`}
                  alt={`Reply Image ${idx}`}
                />
              )
          )
        )}
      </div>

      <div className="reply-review">
        <p>상품 구매후기</p>
      </div>

      <div className="review-container">
        <div className="review-checkbox">
          <input type="checkbox" id="option1" name="option" />
          <label htmlFor="option1">포토후기만 보기</label>
        </div>

        {/* 드롭다운 메뉴 */}
        <div className="dropdown-container">
          <div className="sort-button" onClick={toggleDropdown}>
            {sortOption}{" "}
            <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>
              <i class="ri-arrow-down-s-line" style={{ fontSize: "20px" }}></i>
            </span>
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div
                className="active"
                onClick={() => handleSortOptionClick("평점 높은순")}
              >
                평점 높은순
              </div>
              <div onClick={() => handleSortOptionClick("평점 낮은순")}>
                평점 낮은순
              </div>
              <div onClick={() => handleSortOptionClick("최신순")}>최신순</div>
            </div>
          )}
        </div>
      </div>

      <div className="review-id-date">
        <div style={{ fontSize: "20px" }}>
          {isReplyValid && reply[0].replyUserId
            ? reply[0].replyUserId.slice(0, -2) + "**"
            : ""}
        </div>

        {isReplyValid && reply[0].indate
          ? new Date(reply[0].indate)
              .toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .replace(/(\d{2})\.$/, "$1")
          : ""}
      </div>

      {/* 별점 표시 */}
      <div className="review-star">
        {isReplyValid && reply[0].replyRating > 0 ? (
          <div className="star-rating">
            <span className="rating-text">평점 </span>
            {[...Array(reply[0].replyRating)].map((_, index) => (
              <i key={index} className="ri-star-fill"></i> // 채워진 별
            ))}
            {[...Array(5 - reply[0].replyRating)].map((_, index) => (
              <i key={index} className="ri-star-line"></i> // 빈 별
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ProductInfoReply;
