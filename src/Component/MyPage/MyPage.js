import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginAction, fetchOrders } from "../../store/userSlice";
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import Wishlist from "./Wishlist";
import RecentlyViewed from "./RecentlyViewed";
import "./ProfileCard.css";
import "./MyPage.css";
import "./Wishlist.css";
import "./OrderHistory.css";
import ReviewModal from "./ReviewModal";
import jaxios from "../../util/jwtUtil";

const MyPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loginUser = useSelector(state => state.user);
    const [userInfo, setUserInfo] = useState(null);
    const [likedProducts, setLikedProducts] = useState([]);
    const memberId = useSelector(state => state.user.memberId);
    const { loading, error } = useSelector(state => state.user);
    const [recentOrders, setRecentOrders] = useState([]); // ✅ useState로 상태 선언

    const [isFetchingLikes, setIsFetchingLikes] = useState(false);
    const [isFetchingOrders, setIsFetchingOrders] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewableOrders, setReviewableOrders] = useState({});

    // ✅ localStorage에서 로그인 정보 가져오기
    const getStoredUser = () => {
        const storedUserStr = localStorage.getItem("loginUser");
        if (storedUserStr) {
            try {
                return JSON.parse(storedUserStr);
            } catch (error) {
                console.error("❌ 로그인 정보 파싱 오류:", error);
            }
        }
        return null;
    };

    // ✅ Redux 상태 업데이트를 기다린 후 로그인 여부 확인
    useEffect(() => {
        if (!loginUser?.memberId) {
            const storedUser = getStoredUser();
            if (!storedUser?.memberId) {
                console.warn("🚨 로그인 정보 없음 → 로그인 페이지 이동");
                navigate("/login");
                return;
            }
            console.log("✅ Redux 상태 업데이트: ", storedUser);
            dispatch(loginAction(storedUser));
        }
    }, [loginUser, dispatch, navigate]); // ✅ Redux 상태 변경 시 한 번만 실행되도록 조정

    // ✅ Redux 상태가 변경될 때 `points` 값 강제 업데이트 (추가됨)
    useEffect(() => {
        if (loginUser?.points !== undefined) {
            setUserPoints(loginUser.points);
        }
    }, [loginUser.points]); // ✅ Redux 상태가 변경될 때 실행
    
    
    
    
    // ✅ 좋아요한 상품 목록 가져오기
    useEffect(() => {
        const fetchLikedProducts = async () => {
            if (!memberId || isFetchingLikes) return; // ✅ 중복 요청 방지
            setIsFetchingLikes(true); // API 요청 시작

            try {
                const apiUrl = `/api/post/getUserLikes?memberId=${encodeURIComponent(memberId)}`;
                console.log("📡 좋아요 목록 API 요청: ", apiUrl);
                const response = await jaxios.get(apiUrl);
                setLikedProducts(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("❌ 좋아요 목록을 불러오는 중 오류 발생:", error);
            } finally{
                setIsFetchingLikes(false);
            }
        };
        fetchLikedProducts();
    }, [memberId]);

    useEffect(() => {
        fetchRecentOrders(); // ✅ 서버에서 직접 주문 내역 가져오기
    }, [memberId]);
    
    const fetchRecentOrders = async () => {
        if (!memberId) return;
        try {
            console.log("📡 최근 주문 내역 요청:", memberId);
            const response = await jaxios.get(`/api/orders/history/${memberId}?page=0&size=3`);
            if (Array.isArray(response.data)) {
                setRecentOrders(response.data); // ✅ 직접 상태 업데이트하여 UI 즉시 반영
                response.data.forEach(order => checkReviewableStatus(order.orderSeq)); // ✅ 리뷰 가능 여부 체크
            } else {
                setRecentOrders([]);
            }
        } catch (error) {
            console.error("🚨 최근 주문 내역 불러오기 실패:", error);
        }
    };
    
    // ✅ 구매 확정 후 UI 즉시 업데이트
    const confirmPurchase = async (orderSeq) => {
        try {
            console.log(`🛠 구매 확정 요청: 주문번호 ${orderSeq}`);
            const response = await jaxios.post(`/api/orders/confirm/${orderSeq}`);
    
            if (response.data?.success) {
                alert("구매가 확정되었습니다!");
                fetchRecentOrders(); // ✅ 주문 목록 즉시 갱신
            } else {
                alert(response.data?.message || "구매 확정에 실패했습니다.");
            }
        } catch (error) {
            console.error("🚨 구매 확정 요청 실패:", error.response?.data || error.message);
            alert("구매 확정 중 오류가 발생했습니다.");
        }
    };
    

// ✅ 리뷰 작성 가능 여부 조회 (중복 요청 방지)
const checkReviewableStatus = async (orderSeq) => {
    if (reviewableOrders.hasOwnProperty(orderSeq)) return; // ✅ 이미 조회한 주문이면 중복 요청 방지

    try {
        console.log(`📡 리뷰 가능 여부 조회: 주문번호 ${orderSeq}`);
        const response = await jaxios.get(`/api/orders/${orderSeq}/order-products`);
        
        if (!Array.isArray(response.data)) return;

        const reviewableProducts = response.data.filter(product => !product.reviewWritten);
        setReviewableOrders(prev => ({ ...prev, [orderSeq]: reviewableProducts.length > 0 }));
    } catch (error) {
        console.error("🚨 리뷰 가능 여부 확인 실패:", error);
    }
};

// ✅ 리뷰 작성 버튼 클릭 시 주문 상품 조회 후 모달 열기
const handleReviewClick = async (orderSeq) => {
    try {
        console.log(`📡 주문 상품 조회 요청: 주문번호 ${orderSeq}`);
        const response = await jaxios.get(`/api/orders/${orderSeq}/order-products`);
        
        if (!Array.isArray(response.data) || response.data.length === 0) {
            alert("이 주문에 포함된 상품이 없습니다.");
            return;
        }

        const reviewableProducts = response.data.filter(product => !product.reviewWritten);

        if (reviewableProducts.length === 0) {
            alert("이미 모든 상품에 대한 리뷰를 작성하셨습니다!");
            return;
        }

        setSelectedProducts(reviewableProducts);
        setIsModalOpen(true);
    } catch (error) {
        console.error("🚨 주문한 상품 목록 불러오기 실패:", error);
        alert("주문한 상품을 불러오는 중 오류가 발생했습니다.");
    }
};

    useEffect(() => {
        if (recentOrders.length > 0) {
            recentOrders.forEach(order => checkReviewableStatus(order.orderSeq));
        }
    }, [recentOrders]);


    // ✅ 리뷰 작성 페이지로 이동
    const handleWriteReview = (productSeq) => {
        if (!productSeq) {
            alert("상품 정보를 찾을 수 없습니다.");
            return;
        }
        navigate(`/review/${productSeq}`);
        setIsModalOpen(false);
    };

    
    return (
        <div className="mypage-container">
            <Sidebar />
            <div className="mypage-box">
                <div className="mypage-content">
                    <ProfileCard 
                        userId={userInfo?.memberId} // Redux 상태 기반으로 userId 전달
                        nickname={userInfo?.memberName || "사용자"} 
                    />
                    <h3>최근 주문 내역</h3>
                    <div className="mypage-section mypage-recent-orders">
                        {loading ? (
                            <p>로딩 중...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : recentOrders.length > 0 ? (
                            <table className="order-table">
                                <thead>
                                    <tr>
                                        <th>주문일</th>
                                        <th>주문번호</th>
                                        <th>결제금액</th>
                                        <th>상태</th>
                                        <th>구매확정</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.orderSeq}>
                                            <td>{order.orderDate?.split("T")[0]}</td>
                                            <td>{order.orderSeq}</td>
                                            <td>{parseFloat(order.finalPrice).toLocaleString()}원</td>
                                            <td>{order.orderStatus}</td>
                                            <td>
                                                {["PURCHASE_CONFIRMED", "구매 확정"].includes(order.orderStatus) ? (
                                                    <button 
                                                        className="review-button"
                                                        onClick={() => handleReviewClick(order.orderSeq)}
                                                        disabled={!reviewableOrders[order.orderSeq]} // ✅ 리뷰 불가능한 경우 버튼 비활성화
                                                    >
                                                        리뷰 작성
                                                    </button>
                                                ) : ["DELIVERED", "배송 완료"].includes(order.orderStatus) ? (
                                                    <button 
                                                        className="confirm-button"
                                                        onClick={async () => {
                                                            await confirmPurchase(order.orderSeq);
                                                            dispatch(fetchOrders({ memberId, page: 0, size: 3 }));
                                                        }}
                                                    >
                                                        구매확정
                                                    </button>
                                                ) : (
                                                    <button className="confirm-button" disabled>
                                                        구매확정
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>주문 내역이 없습니다.</p>
                        )}
                        <button className="view-more-btn" onClick={() => navigate("/mypage/orders")}>
                            전체 주문 내역 보기
                        </button>
                    </div>
                    <h3>좋아요한 상품</h3>
                    <div className="mypage-section mypage-activity">
                        <Wishlist favoriteItems={likedProducts} />  {/* ✅ likedProducts 전달 */}
                        <button className="view-more-btn" onClick={() => navigate("/mypage/wishlistPage")}>
                            전체 좋아요 상품 보기
                        </button>
                    </div>

                    <h3>최근 본 상품</h3>
                    <div className="mypage-section mypage-recent-views">
                        <RecentlyViewed />
                    </div>
            </div>
            </div>
            {/* ✅ 모달 추가 (OrderHistoryPage.js와 동일한 기능) */}
            {isModalOpen && (
                <ReviewModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    purchasedProducts={selectedProducts}
                    onWriteReview={handleWriteReview}
                />
            )}
        </div>
    );
};

export default MyPage;
