import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import axios from "axios";
import "./ReviewPage.css";
import jaxios from "../../util/jwtUtil";

const ReviewPage = () => {
    const { orderSeq, productSeq } = useParams();
    console.log("✅ useParams()에서 가져온 orderSeq:", orderSeq);
    console.log("✅ useParams()에서 가져온 productSeq:", productSeq);
    const navigate = useNavigate();
    const [reviewContent, setReviewContent] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewImages, setReviewImages] = useState([]);
    const [productInfo, setProductInfo] = useState(null);
    const [error, setError] = useState(null);
    const memberId = useSelector(state => state.user.memberId);



    // ✅ 상품 정보 가져오기
    useEffect(() => {
        console.log("🔍 ReviewPage에서 받은 productSeq:", productSeq);
    
        if (!productSeq || productSeq === "undefined") {
            console.error("🚨 productSeq가 유효하지 않음!", productSeq);
            setError("상품 정보를 불러올 수 없습니다.");
            return;
        }
    
        axios.get(`http://localhost:8070/product/${productSeq}`)

            .then(response => setProductInfo(response.data))
            .catch(error => {
                console.error("🚨 상품 정보 불러오기 실패:", error);
                setError("상품 정보를 불러오는 중 오류가 발생했습니다.");
            });
    }, [productSeq]);    
    
    // ✅ 리뷰 이미지 업로드 처리
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 3) {
            alert("최대 3개의 이미지만 업로드할 수 있습니다.");
            return;
        }
        setReviewImages(files);
    };

    // ✅ 리뷰 작성 API 요청
    const submitReview = async () => {
        if (!reviewContent.trim()) {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }
    
        const validOrderSeq = orderSeq && !isNaN(Number(orderSeq)) ? Number(orderSeq) : null;
        const validProductSeq = productSeq && !isNaN(Number(productSeq)) ? Number(productSeq) : null;

        if (!validOrderSeq) {
            console.error("🚨 orderSeq가 유효하지 않음!", orderSeq);
            alert("올바른 주문 정보를 찾을 수 없습니다.");
            navigate("/mypage"); // 문제 발생 시 마이페이지로 이동
        }
        
        const requestData = {
            orderSeq: validOrderSeq,  
            productSeq: validProductSeq,  
            reviewContent: reviewContent.trim(),
            reviewRating: Number(reviewRating),  
            memberId: String(memberId)
        };

        console.log("🚀 서버로 보낼 리뷰 데이터:", requestData);
        
        try {
            const response = await jaxios.post("/api/review/save", requestData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            console.log("✅ 리뷰 저장 성공:", response.data);
            alert("리뷰가 등록되었습니다!");
            navigate("/mypage");
        } catch (error) {
            console.error("🚨 리뷰 작성 실패:", error.response?.data || error.message);
            alert("리뷰 작성 중 오류가 발생했습니다.");
        }
    };
    
    const handleStarClick = (rating) => {
        setReviewRating(rating);
    };
    
    <div className="rating-stars">
        {[5, 4, 3, 2, 1].map((star) => (
            <React.Fragment key={star}>
                <input
                    type="radio"
                    id={`star${star}`}
                    name="rating"
                    value={star}
                    checked={reviewRating === star}
                    onChange={() => handleStarClick(star)}
                />
                <label htmlFor={`star${star}`}>★</label>
            </React.Fragment>
        ))}
    </div>
    
    return (
        <div className="mypage-container">
            <div className="mypage-box">
            <Sidebar />
            <div className="mypage-content">
                    <ProfileCard />
                    <div className="points-section">
            <h2>리뷰 작성</h2>
            {error ? (
                <p className="error-message">{error}</p>
            ) : productInfo ? (
                <div className="product-info">
                {/* ✅ 제품명 표시 */}
                <h3>{productInfo.name}</h3>  {/* 여기서 제품 이름을 표시 */}
                <img src={productInfo.imageUrl} alt={productInfo.name} className="product-image" />
            </div>
            ) : (
                <p>상품 정보를 불러오는 중...</p>
            )}
            <textarea
                className="review-input"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="상품에 대한 후기를 남겨주세요."
            />
            <div className="rating-section">
                            <label>별점:</label>
                            <div className="rating-stars">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <React.Fragment key={star}>
                                        <input
                                            type="radio"
                                            id={`star${star}`}
                                            name="rating"
                                            value={star}
                                            checked={reviewRating === star}
                                            onChange={() => setReviewRating(star)} // 클릭 시 별점 변경
                                        />
                                        <label htmlFor={`star${star}`}>★</label>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
            <div className="image-upload">
                <label>이미지 업로드 (최대 3장)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            </div>
            <button className="submit-review-button" onClick={submitReview}>
                리뷰 등록
            </button>
        </div>
        </div>
        </div>
        </div>
    );
};

export default ReviewPage;
