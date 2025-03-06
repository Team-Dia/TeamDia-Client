import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../store/userSlice";
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import ReviewModal from "./ReviewModal";
import "./MyPage.css";
import "./OrderHistory.css";
import jaxios from "../../util/jwtUtil";

const OrdersPage = () => {
    const memberId = useSelector(state => state.user.memberId);
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]); 
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        if (!memberId) {
            console.error("❌ memberId가 없음. 주문 내역 요청을 중단합니다.");
            return;
        }

        console.log("📡 주문 내역 요청:", memberId);
        setLoading(true);

        jaxios.get(`/api/orders/history/${memberId}?page=${page}&size=${size}`)

        .then(response => {
            console.log("📡 주문 내역 응답:", response.data);
            if (!Array.isArray(response.data) || response.data.length === 0) {  // ✅ response.data가 배열인지 확인
                setError("주문 내역이 없습니다.");
            } else {
                setOrders(response.data);  // ✅ 전체 데이터를 orders 상태에 저장
            }
        })
        .catch(error => {
            console.error("🚨 주문 내역 불러오기 실패:", error);
            setError("주문 내역을 불러오는 중 오류가 발생했습니다.");
        })
        .finally(() => {
            setLoading(false);
        });

    }, [memberId, page, size]);

    // ✅ 구매 확정 요청 함수
    const confirmPurchase = async (orderSeq) => {
        try {
            console.log(`🛠 구매 확정 요청 시작: 주문번호 ${orderSeq}`); 
            const response = await jaxios.post(`/api/orders/confirm/${orderSeq}`);
    
            console.log("📡 구매 확정 응답:", response.data);
            if (response.data.success) {
                alert("구매가 확정되었습니다!");
                // ✅ Redux 상태 업데이트하여 UI 반영
                dispatch(fetchOrders({ memberId, page: 0, size: 3 }));
            } else {
                console.warn("🚨 구매 확정 실패 (응답 데이터 오류):", response.data);
                alert("구매 확정에 실패했습니다.");
            }
        } catch (error) {
            console.error("🚨 구매 확정 요청 실패:", error.response?.data || error.message);
            alert("구매 확정 중 오류가 발생했습니다.");
        }
    };

    // ✅ 리뷰 작성 버튼 클릭 시 주문 내역을 조회하여 모달을 열기
    const handleReviewClick = async (orderSeq) => {
        try {
            console.log(`📡 주문 상품 조회 요청: 주문번호 ${orderSeq}`);
            const response = await jaxios.get(`/api/orders/${orderSeq}/order-products`);
            
            console.log("📡 주문한 상품 목록 응답:", response.data);
    
            if (!response.data || response.data.length === 0) {
                alert("이 주문에 포함된 상품이 없습니다.");
                return;
            }
    
            setSelectedProducts(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("🚨 주문한 상품 목록 불러오기 실패:", error);
            alert("주문한 상품을 불러오는 중 오류가 발생했습니다.");
        }
    };
    
    


    // ✅ 리뷰 작성 페이지로 이동
    const handleWriteReview = (productSeq) => {
        navigate(`/review/${productSeq}`);
        setIsModalOpen(false); // 모달 닫기
    };
    
    return (
        <div className="mypage-container">
            <div className="mypage-box">
            <Sidebar />
            <div className="mypage-content">
                    <ProfileCard />
                    <div className="points-section">
                    <h2>주문 내역</h2>
                    {loading ? (
                        <p>로딩 중...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : (
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>주문 날짜</th>
                                    <th>주문 번호</th>
                                    <th>결제 금액</th>
                                    <th>상태</th>
                                    <th>구매확정</th>
                                </tr>
                            </thead>
                            <tbody>
    {orders.map(order => (
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
                    >
                        리뷰 작성
                    </button>
                ) : ["DELIVERED", "배송 완료"].includes(order.orderStatus) ? (
                    <button 
                        className="confirm-button"
                        onClick={async () => {
                            await confirmPurchase(order.orderSeq);
                            setOrders(prevOrders => 
                                prevOrders.map(o =>
                                    o.orderSeq === order.orderSeq
                                        ? { ...o, orderStatus: "PURCHASE_CONFIRMED" }
                                        : o
                                )
                            );
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

                    )}
                    <div className="custom-pagination">
                        <button 
                            disabled={page === 0} 
                            onClick={() => setPage(page - 1)}
                        >
                            ◀ 이전
                        </button>
                        <span>{page + 1} / {totalPages}</span> {/* ✅ 현재 페이지 / 전체 페이지 표시 */}
                        <button 
                            disabled={page + 1 >= totalPages} 
                            onClick={() => setPage(page + 1)}
                        >
                            다음 ▶
                        </button>
                    </div>

                </div>
            </div>
        </div>

{/* ✅ 모달이 `isModalOpen === true`일 때만 렌더링되도록 변경 */}
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

export default OrdersPage;
