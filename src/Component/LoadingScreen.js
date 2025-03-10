import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../style/LoadingScreen.css";

const messages = [
  "고객님을 위한 최고의 상품을 찾고 있어요!",
  "잠시만 기다려 주세요, 맞춤 추천 상품을 준비 중이에요.",
  "필터를 적용하는 중입니다... 기대하셔도 좋아요!",
];

const LoadingScreen = ({ onCancel }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [bestProducts, setBestProducts] = useState([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

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

  useEffect(() => {
    axios
      .get("/api/product/bestPro")
      .then((result) => {
        console.log("📢 베스트 상품 응답 데이터:", result.data.bestProduct);
        if (
          Array.isArray(result.data.bestProduct) &&
          result.data.bestProduct.length > 0
        ) {
          setBestProducts(result.data.bestProduct);
        }
      })
      .catch((err) => {
        console.error("❌ 베스트 상품 가져오기 실패:", err);
      });
  }, []);

  // ✅ 메시지와 상품 변경 (3초마다 변경)
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);

      if (bestProducts.length > 0) {
        setCurrentProductIndex((prev) => (prev + 1) % bestProducts.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bestProducts]);

  return (
    <div className="loading-screen-overlay">
      <div className="loading-screen-spinner"></div>
      <p className="loading-screen-message">{messages[messageIndex]}</p>

      {bestProducts.length > 0 && (
        <div className="loading-screen-product-preview">
          <Link
            to={`/producDetail/${bestProducts[currentProductIndex].productSeq}`}
          >
            <div className="loading-screen-image-container">
              <img
                className="loading-screen-product-image"
                src={getImageUrl(bestProducts[currentProductIndex].productImage)} // 🔹 수정됨: S3 URL 적용
                // src={`http://localhost:8070/product_images/${bestProducts[currentProductIndex].productImage}`}
                alt={
                  bestProducts[currentProductIndex].productName || "상품 이미지"
                }
              />
            </div>
          </Link>
          <div className="loading-screen-product-info-container">
            <p className="loading-screen-product-info">이 상품을 추천합니다!</p>
            <p className="loading-screen-product-name">
              {bestProducts[currentProductIndex].productName ||
                "상품 이름 없음"}
            </p>
          </div>
        </div>
      )}

      {/* ✅ 취소 버튼 클릭 시 onCancel 실행 */}
      <button className="loading-screen-cancel-button" onClick={onCancel}>
        취소
      </button>
    </div>
  );
};

export default LoadingScreen;
