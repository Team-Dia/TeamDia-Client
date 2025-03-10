import React from "react";
import "./ProductInfoReview.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ProductInfoReview = ({ review }) => {
  const [selectedTab, setSelectedTab] = useState("detail"); // 'detail'이 기본 선택된 상태
  const [product, setProduct] = useState({});
  const [productImages, setProductImages] = useState([]); // 이미지 데이터를 저장할 상태
  const { productSeq } = useParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열기/닫기 상태
  const [sortOption, setSortOption] = useState("평점 높은순"); // 기본 정렬 기준
  const [sortedReviews, setSortedReviews] = useState(review); // 정렬된 리뷰 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열기/닫기 상태
  const [modalImage, setModalImage] = useState(null); // 클릭한 이미지 URL
  const [modalData, setModalData] = useState(null);
  const [showPhotoReviewsOnly, setShowPhotoReviewsOnly] = useState(false); // 포토 후기만 보기 상태
  const navigate = useNavigate();

  // ✅ 기존 데이터와 S3 데이터를 구분하여 이미지 표시
  const getImageUrl = (imagePath, type = "review") => {
    if (!imagePath || imagePath === "null") return "/default-image.png"; // 기본 이미지 처리
    if (imagePath.startsWith("http")) return `${imagePath}?t=${new Date().getTime()}`;
    // ✅ infoImage는 "product_infoimages", reviewImage는 "product_images"에서 가져오도록 구분
    const folder = type === "info" ? "product_infoimages" : "product_images";
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/${folder}/${imagePath}`;
  };
  // console.log("🔍 infoImage URL:", getImageUrl(productImages[0]?.infoImage));
  console.log("🔍 infoImage URL 11:", getImageUrl(productImages[0]?.infoImage));
  console.log("🔍 infoImage2 URL 11:", getImageUrl(productImages[0]?.infoImage2));
  
  // 이미지 클릭 시 이동할 함수
  const handleImageClick = (image, index, item) => {
    navigate("/reviewDetail", {
      state: {
        reviewItem: item, // 리뷰 전체 정보 전달
        reviewImage: image, // 클릭한 이미지
        reviewIndex: index, // 해당 이미지의 index
        reviewId: item.reviewSeq, // 리뷰 ID
        product: item.product, // 상품 정보 (필요시)
      },
    });
  };

  // 모달 열기
  const openModal = (reviewItem) => {
    setModalData(reviewItem); // 클릭한 리뷰 아이템을 모달에 전달
    setIsModalOpen(true); // 모달 열기
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null); // 모달 닫을 때 데이터 초기화
  };

  // 탭 클릭 시 상태 업데이트
  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 정렬 기준 선택
  const handleSortOptionClick = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false); // 메뉴 닫기
    sortReviews(option); // 선택한 기준으로 리뷰 정렬
  };

  // 리뷰 정렬 함수
  const sortReviews = (option) => {
    let sortedData = [...review]; // 원본 배열을 복사하여 정렬을 진행합니다.

    switch (option) {
      case "평점 높은순":
        sortedData.sort((a, b) => b.reviewRating - a.reviewRating); // 높은 평점 순
        break;
      case "평점 낮은순":
        sortedData.sort((a, b) => a.reviewRating - b.reviewRating); // 낮은 평점 순
        break;
      case "최신순":
        sortedData.sort((a, b) => new Date(b.indate) - new Date(a.indate)); // 최신순 (작성일 기준)
        break;
      default:
        break;
    }

    setSortedReviews(sortedData); // 정렬된 데이터를 상태에 업데이트
  };

  // 포토 후기만 보기 체크박스를 클릭하면 상태를 변경
  const handleCheckboxChange = (e) => {
    setShowPhotoReviewsOnly(e.target.checked);
  };

  // 리뷰 필터링 함수
  const getFilteredReviews = () => {
    if (Array.isArray(sortedReviews) && sortedReviews.length > 0) {
      if (showPhotoReviewsOnly) {
        // 사진이 있는 리뷰만 필터링
        const filteredReviews = sortedReviews.filter(
          (reviewItem) =>
            reviewItem.reviewImage ||
            reviewItem.reviewImage1 ||
            reviewItem.reviewImage2
        );
        console.log(filteredReviews); // 필터링된 리뷰 출력
        return filteredReviews; // 필터링된 배열 반환
      }
      return sortedReviews; // 모든 리뷰 반환
    }
    console.log([]); // 빈 배열 출력
    return []; // 배열이 아닐 경우 빈 배열 반환
  };

  let currentSlide = 0;

  function moveSlide(step) {
    const slides = document.querySelector(".slider");
    const totalSlides = document.querySelectorAll(".slide").length;
    currentSlide += step;

    // 슬라이드 범위 제한
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    if (currentSlide >= totalSlides) currentSlide = 0;

    // 슬라이드 이동
    slides.style.transform = `translateX(-${currentSlide * 20}%)`;
  }

  // 서버에서 제품 이미지 로드
  useEffect(() => {
    axios
      .get(`/api/product/selectPro`, { params: { productSeq } })
      .then((result) => {
        console.log("📢 서버에서 받아온 productImages 데이터:", result.data.productImages);
        // 데이터를 배열로 변환하여 저장 (객체일 경우 배열로 감싸기)
      const images = Array.isArray(result.data.productImages)
      ? result.data.productImages
      : [result.data.productImages];

      setProductImages(images);
      })
    .catch((err) => {
      console.error("❌ 상품 이미지 가져오기 실패:", err);
      setProductImages([]);
    });
  }, [productSeq]);

  useEffect(() => {
    if (review && review.length > 0) {
      sortReviews("평점 높은순");
    }
  }, [review]);

  const isReviewValid = Array.isArray(review) && review.length > 0;
  
  console.log("🔍 productImage 데이터 확인:", productImages);
  console.log("🔍 infoImage URL 11:", getImageUrl(productImages[0]?.infoImage));
  console.log("🔍 infoImage2 URL:", getImageUrl(productImages.infoImage2));
  console.log("🖼️ 최종적으로 적용된 이미지 URL:", getImageUrl(productImages[0]?.infoImage));


  return (
    <div className="inforereview-container">
      <div className="inforereview-header">
        <div
          id="header-button"
          className={selectedTab === "detail" ? "active" : "inactive"}
          onClick={() => handleTabClick("detail")}
        >
          상세 정보
        </div>
        <div
          id="header-button"
          style={{ cursor: "pointer" }}
          className={selectedTab === "review" ? "active" : "inactive"}
          onClick={() => {
            handleTabClick("review");
            document.getElementById("reviews-section").scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          상품 후기&nbsp;{review.length > 0 && `(${review.length})`}
        </div>
      </div>

      <div className="info-product">
        {productImages.length > 0 && productImages[0] ? (
          <>
            {productImages[0].infoImage && (
              <img
                key={`infoImage-${productImages[0].infoImage}`}
                src={getImageUrl(productImages[0]?.infoImage, "info")}
                alt="infoImage"
              />
            )}
            {productImages[0].infoImage2 && (
              <img
                key={`infoImage2-${productImages[0].infoImage2}`}
                src={getImageUrl(productImages[0]?.infoImage2, "info")}
                alt="infoImage2"
              />
            )}
          </>
        ) : (
          <p>로딩 중...</p>
        )}
      </div>


      {/* <div className="info-product">
        {productImages.length > 0 && productImages[0] ? (
          productImages.map((productImages, idx) => (
            <>
              {productImages[0].infoImage && (
                <img
                  key={`infoImage-${productImages[0].infoImage}-${idx}`} // infoImage와 idx를 결합하여 고유한 key를 생성
                  src={getImageUrl(productImages[0].infoImage)}
                  // src={`http://localhost:8070/product_infoimages/${productImage.infoImage}`}
                  alt={`Product Image ${idx}`}
                />
              )}
              {productImages[0].infoImage2 && (
                <img
                  key={`infoImage2-${productImages[0].infoImage2}-${idx}`} // infoImage2와 idx를 결합하여 고유한 key를 생성
                  src={getImageUrl(productImages[0].infoImage2)}
                  // src={`http://localhost:8070/product_infoimages/${productImage.infoImage2}`}
                  alt={`Product Image 2 ${idx}`}
                />
              )}
            </>
          ))
        ) : (
          <p>로딩 중...</p>
        )}
      </div> */}

      <div className="review-photo">
        <p>후기 사진</p>
      </div>

      <div className="review-img">
        {!review || review.length === 0 ? (
          <p>후기가 없습니다</p>
        ) : (
          <div className="slider-container">
            <div className="slider">
              {review.map(
                (reviewItem) =>
                  reviewItem.reviewImage && (
                    <div
                      className="slide"
                      key={`reviewImage-${reviewItem.reviewSeq}`}
                      onClick={() => openModal(reviewItem)} // 리뷰 정보를 모달로 전달
                    >
                      <img
                        src={getImageUrl(reviewItem.reviewImage)}
                        // src={`http://localhost:8070/product_images/${reviewItem.reviewImage}`}
                        alt="reviewImage"
                      />
                    </div>
                  )
              )}
            </div>

            {/* 화살표 버튼 */}
            <button className="sli-prev" onClick={() => moveSlide(-5)} id="sbt">
              &#10094;
            </button>
            <button className="sli-next" onClick={() => moveSlide(5)} id="sbt">
              &#10095;
            </button>

            {/* 모달 */}
            {isModalOpen && modalData && (
              <div className="modal-overlay" onClick={closeModal}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <p style={{ fontSize: "25px", fontWeight: "bold" }}>
                      후기 사진 모아보기
                    </p>
                    <button className="close-btn" onClick={closeModal}>
                      X
                    </button>
                  </div>

                  <div className="modal-container">
                    {/* 이미지 표시 */}
                    <img
                      src={`http://localhost:8070/product_images/${modalData.reviewImage}`}
                      alt="Modal Image"
                      className="modal-image"
                    />

                    <div className="modal-info">
                      {/* 리뷰 작성자 표시 */}
                      <div className="modal-name-indate">
                        <div>
                          {modalData.member.memberId
                            ? modalData.member.memberId.slice(0, -2) + "**"
                            : ""}
                        </div>

                        {/* 날짜 표시 */}
                        {modalData.indate && (
                          <div>
                            {new Date(modalData.indate)
                              .toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                              .replace(/(\d{2})\.$/, "$1")}
                          </div>
                        )}
                      </div>

                      {/* 평점 표시 */}
                      <div style={{ marginTop: "10px" }}>
                        평점:{" "}
                        {[...Array(modalData.reviewRating)].map(
                          (_, starIndex) => (
                            <i key={starIndex} className="ri-star-fill"></i>
                          )
                        )}{" "}
                      </div>

                      {/* 리뷰 내용 */}
                      <div style={{ marginTop: "100px" }}>
                        {modalData.reviewContent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="review-review" id="reviews-section">
        <p>상품 구매후기</p>
        <p style={{ marginBottom: "5px" }}>
          {review.length > 0 && `(${review.length})`}
        </p>
      </div>

      <div className="review-container">
        <div className="review-checkbox">
          <input
            type="checkbox"
            id="option1"
            name="option"
            checked={showPhotoReviewsOnly} // 체크박스 상태
            onChange={handleCheckboxChange} // 체크박스 상태 변경 함수
          />
          <label htmlFor="option1" style={{ marginTop: "7px" }}>
            포토후기만 보기
          </label>
        </div>

        {/* 드롭다운 메뉴 */}
        <div className="dropdown-container">
          <div className="sort-button" onClick={toggleDropdown}>
            {sortOption}{" "}
            <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>
              <i
                className="ri-arrow-down-s-line"
                style={{ fontSize: "20px" }}
              ></i>
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

      <div className="reviews-list">
        {isReviewValid && review.length > 0 ? (
          getFilteredReviews().map((item, idx) => (
            <div key={`review-${item.reviewId || idx}`} className="review-item">
              <div className="review-id-date">
                <div style={{ fontSize: "20px" }}>
                  {item.member.memberId
                    ? item.member.memberId.slice(0, -2) + "**"
                    : ""}
                </div>
                {item.indate ? (
                  <div>
                    {new Date(item.indate)
                      .toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      .replace(/(\d{2})\.$/, "$1")}
                  </div>
                ) : (
                  ""
                )}
              </div>

              {/* 별점 표시 */}
              <div className="review-star">
                {item.reviewRating > 0 ? (
                  <div className="star-rating">
                    <span className="rating-text">평점 </span>
                    {[...Array(item.reviewRating)].map((_, starIndex) => (
                      <i key={starIndex} className="ri-star-fill"></i> // 채워진 별
                    ))}
                    {[...Array(5 - item.reviewRating)].map((_, starIndex) => (
                      <i key={starIndex} className="ri-star-line"></i> // 빈 별
                    ))}
                  </div>
                ) : (
                  <span>평점 없음</span> // 평점이 없을 때
                )}
              </div>

              {/* 리뷰 내용 */}
              <div className="review-text">
                {item.reviewContent ? (
                  <div>{item.reviewContent}</div>
                ) : (
                  <p>리뷰 내용이 없습니다.</p> // 리뷰가 없을 경우 대체 텍스트
                )}
              </div>

              {/* 리뷰 이미지 */}
              <div className="rev-img">
                {[item.reviewImage, item.reviewImage1, item.reviewImage2].map(
                  (image, index) =>
                    image ? (
                      <img
                        key={index} // 각 이미지마다 고유한 key
                        src={getImageUrl(image)}
                        // src={`http://localhost:8070/product_images/${image}?t=${new Date().getTime()}`}
                        alt={`ReviewImage ${index + 1}`}
                        onClick={() => handleImageClick(image, index, item)} // 이미지 클릭 시 해당 함수 실행
                        style={{ cursor: "pointer" }} // 클릭할 수 있다는 것을 표시
                      />
                    ) : null // 이미지가 없으면 아무것도 렌더링하지 않음
                )}
              </div>

              <div className="sun"></div>
            </div>
          ))
        ) : (
          <p>리뷰가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default ProductInfoReview;
