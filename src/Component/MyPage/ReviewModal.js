import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReviewModal.css";
import jaxios from "../../util/jwtUtil";
const ReviewModal = ({ isOpen, onClose, purchasedProducts, onWriteReview }) => {
  const navigate = useNavigate();
  const [reviewStatus, setReviewStatus] = useState([]);

  const checkReviews = async () => {
    if (!purchasedProducts || purchasedProducts.length === 0) return;

    console.log("📡 리뷰 상태 조회 요청:", purchasedProducts);

    try {
      // ✅ 여러 개의 상품을 한 번의 API 요청으로 조회 (Promise.all() 사용)
      const reviewChecks = purchasedProducts.map((detail) =>
        jaxios.get(`/api/review/check`, {
          params: { orderSeq: detail.orderSeq, productSeq: detail.productSeq },
        })
      );

      const results = await Promise.all(reviewChecks);

      // ✅ 응답 데이터를 기반으로 상태 매핑
      const statusMap = purchasedProducts.reduce((acc, detail, index) => {
        acc[`${detail.orderSeq}-${detail.productSeq}`] =
          results[index].data.exists;
        return acc;
      }, {});

      setReviewStatus(statusMap);
    } catch (error) {
      console.error("🚨 리뷰 상태 확인 실패:", error);
    }
  };

  // ✅ 리뷰 작성 후 버튼 상태 즉시 변경
  const handleWriteReview = (detail) => {
    if (!detail.orderSeq) {
      console.error("🚨 orderSeq가 존재하지 않습니다!", detail);
      alert("주문 정보를 찾을 수 없습니다.");
      return;
    }

    // ✅ UI 상태 즉시 업데이트
    setReviewStatus((prevStatus) => ({
      ...prevStatus,
      [`${detail.orderSeq}-${detail.productSeq}`]: true, // ✅ 버튼을 비활성화로 변경
    }));

    // ✅ UI 상태 변경 후 페이지 이동 (setTimeout으로 지연 적용)
    setTimeout(() => {
      navigate(`/review/${detail.orderSeq}/${detail.productSeq}`);
    }, 100);
  };

  // ✅ 기존 데이터와 S3 데이터를 구분하여 이미지 표시
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-image.png"; // 기본 이미지 처리

    // ✅ S3 URL인지 확인
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // ✅ 기존 로컬 서버 이미지 경로를 S3 URL로 변경
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/product_images/${imagePath}`;
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-content">
        <h2>구매한 상품 목록</h2>
        <ul className="review-product-list">
          {purchasedProducts.map((detail) => {
            console.log("🔍 상품 정보:", detail);

            const key = `${detail.orderSeq}-${detail.productSeq}`;
            const isReviewWritten = reviewStatus[key] || false; // ✅ 리뷰 상태 가져오기

            return (
              <li key={key} className="review-product-item">
                {/* ✅ 상품 이미지 추가 */}
                <img
                  src={getImageUrl(detail.productImage)} // 🔹 수정됨: S3 URL 적용
                  // src={getImageUrl(detail)}
                  alt={detail.productName || "상품 이미지"}
                  className="review-product-image"
                />
                <span>{detail.productName || "상품명 없음"}</span>
                <button
                  className="review-write-button"
                  disabled={isReviewWritten || !detail.orderSeq} // ✅ 리뷰 작성 여부에 따라 버튼 비활성화
                  onClick={() => handleWriteReview(detail)} // ✅ UI 즉시 반영
                >
                  {isReviewWritten ? "리뷰 작성 완료" : "리뷰 작성"}
                </button>
              </li>
            );
          })}
        </ul>

        <button className="review-close-button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
