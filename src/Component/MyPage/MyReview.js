import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // 🔄 페이지 이동을 위한 useNavigate 추가
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import "./MyReview.css";
import jaxios from '../../util/jwtUtil';

const MyReview = () => {
    const [reviews, setReviews] = useState([]);
    const [paging, setPaging] = useState({ currentPage: 1, totalPages: 1 });
    const user = useSelector((state) => state.user);
    const navigate = useNavigate(); // 🔄 페이지 이동을 위한 useNavigate 설정

    useEffect(() => {
        if (user && user.memberId) {
            fetchReviews(paging.currentPage);
        } else {
            console.error("❌ Redux에서 memberId를 찾을 수 없음!");
        }
    }, [paging.currentPage, user]);

    const fetchReviews = (page) => {
        if (!user || !user.memberId) {
            console.error("로그인 정보 없음");
            return;
        }
    
        jaxios.get(`/api/review/my?memberId=${user.memberId}&page=${page - 1}&size=5&sort=indate,DESC`)
            .then(response => {
                console.log("📢 API 응답 데이터:", response.data.content); // ✅ 데이터 구조 확인
                setReviews(response.data.content);
                setPaging({ currentPage: page, totalPages: response.data.totalPages });
            })
            .catch(error => console.error("리뷰 불러오기 실패", error));
    };

    const goToReviewDetail = (review) => {
        console.log("📢 선택한 리뷰 데이터:", review); // ✅ 콘솔에서 데이터 확인
        navigate(`/mypage/reviewDetail/${review.reviewSeq}`, { state: { review } }); // ✅ 변경된 파일명 반영!
    };

    return (
        <div className="mypage-container">
            <div className="mypage-box">
                <Sidebar />
                <div className="mypage-content">
                    <ProfileCard />  
                        
                    <div className="points-section">
                        <h2>내가 작성한 리뷰</h2>
                        <table className="reviews-table">
                            <thead>
                                <tr>
                                    <th>상품명</th>
                                    <th>작성 날짜</th>
                                    <th>내용</th>
                                    <th>평점</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length > 0 ? (
                                    reviews.map((review) => {
                                        console.log("🔍 리뷰 객체:", review);
                                        const productName = review?.product?.productName || "상품 정보 없음"; // ✅ Null-safe 처리
                                        const formattedDate = review?.indate ? new Date(review.indate).toLocaleDateString() : "날짜 없음";
                                        const reviewContent = review?.reviewContent || "내용 없음";
                                        const reviewRating = "⭐".repeat(review?.reviewRating || 0);

                                        return (
                                            <tr key={review.reviewSeq} onClick={() => goToReviewDetail(review)} style={{ cursor: "pointer" }}>
                                                <td>{productName}</td>
                                                <td>{formattedDate}</td>
                                                <td>{reviewContent}</td>
                                                <td>{reviewRating}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-reviews">작성한 리뷰가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="custom-pagination">
                            <button 
                                disabled={paging.currentPage === 1} 
                                onClick={() => setPaging((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}>
                                ◀ 이전
                            </button>
                            <span>{paging.currentPage} / {paging.totalPages}</span>
                            <button 
                                disabled={paging.currentPage >= paging.totalPages} 
                                onClick={() => setPaging((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}>
                                다음 ▶
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyReview;
