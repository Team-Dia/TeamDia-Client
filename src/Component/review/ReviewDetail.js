import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react"; // useState, useEffect 추가
import "./ReviewDetail.css";

const ReviewDetail = () => {
  const location = useLocation(); // 전달된 state 정보 받기
  const { reviewItem, reviewImage, reviewIndex, reviewId, product } =
    location.state || {};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true); // 처음에는 이전 버튼 비활성화
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  // 리뷰 내용이나 평점이 없다면 기본값 처리

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

  // 리뷰 이미지 배열 만들기
  const reviewImages = useMemo(() => {
    return reviewItem
      ? [
          getImageUrl(reviewImage), // S3 Url 경로로 수정됨
          getImageUrl(reviewItem.reviewImage1),
          getImageUrl(reviewItem.reviewImage2),
          // reviewImage, 
          // reviewItem.reviewImage1, 
          // reviewItem.reviewImage2
        ].filter(Boolean)
      : [];
  }, [reviewItem, reviewImage]);

  useEffect(() => {
    const totalSlides = reviewImages.length;
    setIsPrevDisabled(currentSlide === 0);
    setIsNextDisabled(currentSlide === totalSlides - 1);
  }, [currentSlide]); // ✅ reviewImages 제거

  if (!reviewItem) {
    return <p>리뷰 정보가 없습니다.</p>;
  }

  // 리뷰 작성일 (indate) 처리
  const formattedIndate = reviewItem.indate
    ? new Date(reviewItem.indate)
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/(\d{2})\.$/, "$1")
    : "날짜 정보 없음";

  // 슬라이드 상태 관리

  const moveSlide = (step) => {
    const totalSlides = reviewImages.length;
    let newSlide = currentSlide + step;

    if (newSlide < 0) newSlide = totalSlides - 1; // 마지막 슬라이드로 이동
    if (newSlide >= totalSlides) newSlide = 0; // 첫 번째 슬라이드로 이동

    setCurrentSlide(newSlide);
  };

  const slideWidth = reviewImages.length === 1 ? "90%" : "60%";

  

  return (
    <div className="review-detail-con">
      <div className="review-detail-box">
        <div className="review-detail-header">
          {/* 평점 표시 */}
          <div style={{ marginTop: "5px" }}>
            {[...Array(reviewItem.reviewRating)].map((_, index) => (
              <i key={index} className="ri-star-fill"></i> // 채워진 별
            ))}
            {[...Array(5 - reviewItem.reviewRating)].map((_, index) => (
              <i key={index} className="ri-star-line"></i> // 빈 별
            ))}
          </div>
          &nbsp;&nbsp;
          {/* 리뷰 작성자 (memberId) 표시 */}
          <div>
            <p style={{ color: "rgb(155, 155, 155)" }}>
              {reviewItem.member
                ? reviewItem.member.memberId.slice(0, -2) + "**"
                : "작성자 정보가 없습니다."}
            </p>
          </div>
          &nbsp;
          <span style={{ color: "rgb(155, 155, 155)", margin: "0 5px" }}>
            |
          </span>
          &nbsp;
          {/* 리뷰 작성일 표시 (indate) */}
          <div>
            <p style={{ color: "rgb(155, 155, 155)" }}>{formattedIndate}</p>
          </div>
        </div>

        {/* 리뷰 상품명 */}
        <div className="review-detail-product">
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            {product.productName || "상품 내용이 없습니다."}
          </p>
        </div>

        {/* 리뷰 상품 사이즈 */}
        <div className="review-detail-product-size">
          <p style={{ color: "rgb(155,155,155)", marginTop: "5px" }}>호수 :&nbsp;{reviewItem.ordersDetail?.sizeValue ? reviewItem.ordersDetail.sizeValue : ""}</p>
        </div>

        {/* 리뷰 내용 */}
        <div className="review-detail-content">
          <p style={{ marginTop: "30px" }}>
            {reviewItem.reviewContent || "리뷰 내용이 없습니다."}
          </p>
        </div>

        {/* 리뷰 이미지들 (reviewImage, reviewImage1, reviewImage2) 반복문으로 처리 */}
        {/* 리뷰 이미지 슬라이더 */}
        <div className="review-detail-images">
          <div
            className="rv-review-slider"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              display: "flex",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            {reviewImages.map((image, index) => (
              <div
                key={index}
                className="rv-review-slide"
                style={{ width: slideWidth, flex: `0 0 ${slideWidth}` }}
              >
                <img
                  src={image}
                  // src={`http://localhost:8070/product_images/${image}`}
                  alt={`Review Image ${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* 슬라이드 이동 버튼 (이미지가 2개 이상일 때만 표시) */}
          {reviewImages.length > 1 && (
            <>
              <button
                className="review-slider-button prev"
                onClick={() => moveSlide(-1)}
                disabled={isPrevDisabled}
              >
                &#60;
              </button>
              <button
                className="review-slider-button next"
                onClick={() => moveSlide(1)}
                disabled={isNextDisabled}
              >
                &#62;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
