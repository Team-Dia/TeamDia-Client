import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import profilePlaceholder from "../../Component/image/profile-placeholder.png";
import "./MyReview.css";
import jaxios from '../../util/jwtUtil';

const MyReviewDetail = () => {
    const { reviewSeq } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [review, setReview] = useState(location.state?.review || null);

    console.log("📢 URL에서 받은 reviewSeq:", reviewSeq); 
    console.log("📢 location.state 값:", location.state); 

    useEffect(() => {
        if (!review) {
            jaxios.get(`/api/review/${reviewSeq}`)
                .then(response => {
                    console.log("✅ 서버에서 받아온 리뷰 데이터:", response.data);
                    setReview(response.data);
                })
                .catch(error => {
                    console.error("🚨 리뷰 불러오기 실패:", error);
                });
        }
    }, [reviewSeq, review]);

    // 🔹 리뷰 이미지 배열 만들기
    const reviewImages = useMemo(() => {
        return review ? [review.reviewImage, review.reviewImage1, review.reviewImage2].filter(Boolean) : [];
    }, [review]);

    // 🔹 슬라이드 상태 관리
    const [currentSlide, setCurrentSlide] = useState(0);

    // 🔹 슬라이드 이동 함수
    const moveSlide = (step) => {
        let newSlide = currentSlide + step;
        if (newSlide < 0) newSlide = reviewImages.length - 1;
        if (newSlide >= reviewImages.length) newSlide = 0;
        setCurrentSlide(newSlide);
    };

    if (!review) {
        return <p className="review-detail-error">리뷰 정보를 불러오는 중...</p>;
    }

    return (
        <div className="mypage-container">
            <div className="mypage-box">
                <Sidebar />
                <div className="mypage-content">
                    <ProfileCard />  
                        
                    <div className="review-detail-container">
                        <h2>내가 작성한 리뷰</h2>

                        {/* 🔹 작성자 정보 (프로필 아이콘 추가) */}
                        <div className="review-author-box">
                        <div className="review-author-avatar">
            <img src={profilePlaceholder} alt="User Avatar" />
        </div>
                            <div className="review-author-info">
                                <p className="review-author-name">{review.member?.memberId}</p>
                                <p className="review-date">{new Date(review.indate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* 🔹 리뷰 평점 */}
                        <div className="review-rating">
                            {"⭐".repeat(review.reviewRating)}
                        </div>

                        {/* 🔹 리뷰 내용 */}
                        <div className="review-content-box">
                            <p className="review-text">{review.reviewContent}</p>
                        </div>

                        {/* ✅ 리뷰 이미지 슬라이더 추가 */}
                        {reviewImages.length > 0 && (
                            <div className="review-detail-images">
                                <div 
                                    className="review-slider"
                                    style={{
                                        transform: `translateX(-${currentSlide * 100}%)`,
                                        width: `${reviewImages.length * 100}%`,
                                        display: 'flex',
                                        transition: 'transform 0.5s ease-in-out'
                                    }}
                                >
                                    {reviewImages.map((image, index) => (
                                        <div key={index} className="review-slide">
                                            <img src={`http://localhost:8070/product_images/${image}`} 
                                                alt={`Review Image ${index + 1}`} 
                                                className="review-image" />
                                        </div>
                                    ))}
                                </div>
                                
                                {/* ✅ 슬라이드 이동 버튼 */}
                                {reviewImages.length > 1 && (
                                    <>
                                        <button className="review-slider-button prev" onClick={() => moveSlide(-1)}>&#60;</button>
                                        <button className="review-slider-button next" onClick={() => moveSlide(1)}>&#62;</button>
                                    </>
                                )}

                                {/* ✅ 현재 슬라이드 위치 표시 (ex. "1 / 3") */}
                                <div className="review-slide-counter">
                                    {currentSlide + 1} / {reviewImages.length}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyReviewDetail;
