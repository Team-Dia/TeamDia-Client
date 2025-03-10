import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import jaxios from "../../util/jwtUtil";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { state } = useLocation();
  const location = useLocation();
  const { orderData } = location.state; // 전달된 orderData
  const [orders, setOrders] = useState([]); // 유저의 주문 목록을 저장할 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderItems } = state; // 전달된 product와 user 정보
  const navigate = useNavigate();

  const loginUser = useSelector((state) => state.user);
  console.log("loginUser:", loginUser); // 유저 정보 확인
  console.log("orderData:", orderData); // 유저 정보 확인
  console.log("orderItems:", orderItems); // 유저 정보 확인

  // ✅ 추가된 상태 변수 (포인트 사용 정보 및 최종 결제 금액 저장)
  const [usedPoints, setUsedPoints] = useState(0);
  const [finalPayment, setFinalPayment] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0); // ✅ 적립된 포인트 저장
  // ✅ 주문 총 금액 계산
  const totalPrice = orderItems.reduce(
    (acc, orderItem) => acc + orderItem.totalPrice,
    0
  );

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

  const fetchOrderList = async () => {
    try {
      setIsLoading(true);
      // 백엔드의 주문 목록 조회 API 호출
      const response = await jaxios.get(`/api/orders/${orderData.memberId}`);
      console.log(response.data);
      setOrders(response.data); // 응답 데이터는 OrdersResponseDTO 형태로 전달됨
    } catch (err) {
      setError("주문 목록을 가져오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 사용한 포인트 및 최종 결제 금액 설정
  useEffect(() => {
    if (orderData.length > 0) {
      setUsedPoints(orderData[0].usedPoints || 0); // 사용한 포인트 가져오기
      setFinalPayment(totalPrice - (orderData[0].usedPoints || 0)); // 최종 결제 금액 반영
      setEarnedPoints(
        Math.floor((totalPrice - (orderData[0].usedPoints || 0)) * 0.03)
      ); // 적립된 포인트 계산 (결제 금액의 3%)
    }
  }, [orderData, totalPrice]);

  useEffect(() => {
    fetchOrderList();
  }, [orderData.memberId]);

  const splitAddress = (address, limit) => {
    let result = "";

    // 주소 길이가 limit을 초과하면 split하여 줄바꿈 처리
    while (address.length > limit) {
      result += address.slice(0, limit) + "<br />";
      address = address.slice(limit);
    }

    result += address; // 남은 부분 추가
    return result;
  };

  useEffect(() => {
    fetchOrderList(); // 컴포넌트가 마운트되면 주문 목록을 가져옵니다.
  }, [orderData.memberId]);

  return (
    <div className="order-detail-con">
      <div className="order-detail-header">
        <img src="./imgs/shobag.jpg" />
        <h1>주문이 완료되었습니다</h1>
        <p>{moment(orderData.orderDate).format("YYYY-MM-DD")}</p>
        {/* <p style={{marginTop:'10px'}}>주문 감사합니다</p> */}

        <div className="detail-header-btn">
          <button
            style={{ border: "1px solid #799fc4", color: "#799fc4" }}
            onClick={() => navigate("/")}
          >
            홈으로
          </button>
          <button
            style={{ color: "#868e96" }}
            onClick={() => navigate("/mypage")}
          >
            마이페이지
          </button>
        </div>
      </div>

      <div className="order-detail-body">
        <div className="order-detail-title">
          <h2>주문 상품</h2>
        </div>

        <div className="order-detail-nav">
          <div className="bin-box"></div>
          <p>상품명</p>
          <p>옵션</p>
          <p>수량</p>
          <p>포인트</p>
          <p>결제금액</p>
        </div>

        <div className="order-detail-list">
          {orderItems.length > 0 ? (
            orderItems.map((orderItem) => (
              <div key={orderItem.orderSeq} className="order-detail-item">
                <div className="order-detail-container">
                  <div className="order-detail-image">
                    {orderItem.productImage && (
                      <img
                        src={getImageUrl(orderItem.productImage)} // 🔹 수정됨: S3 URL 적용
                        // src={`http://localhost:8070/product_images/${orderItem.productImage}`}
                        alt={orderItem.productName}
                      />
                    )}
                  </div>

                  <div className="order-detail-content">
                    <p>{orderItem.productName}</p>
                    <p style={{ color: "rgb(8, 8, 8)" }}>
                      옵션: {orderItem.sizeValue}
                    </p>
                    <p>{orderItem.quantity}</p>
                    <p>
                      {new Intl.NumberFormat("ko-KR").format(usedPoints)} P
                    </p>{" "}
                    {/* ✅ 사용한 포인트 반영 */}
                    <p>
                      {new Intl.NumberFormat("ko-KR").format(
                        orderItem.totalPrice
                      )}
                      원
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>주문이 없습니다.</p>
          )}
        </div>

        <div className="detail-delivery">
          <div className="delivery-box">
            <h2>배송지 정보</h2>

            <div className="detail-delivery-info">
              <div className="detail-user-info">
                <div className="detail-box">
                  <div className="detail-info-name">
                    <p>이름</p>
                    <p style={{ marginLeft: "128px" }}>{orderData[0].name}</p>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-info-phone">
                    <p>휴대폰 번호</p>
                    <p style={{ marginLeft: "82px" }}>{orderData[0].phone}</p>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-info-address">
                    <p>배송 주소</p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: splitAddress(orderData[0].shippingAddress, 30),
                      }}
                      style={{ marginLeft: "98px" }}
                    />
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-info-customRequest">
                    <p>요청 사항</p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html:
                          orderData[0].selectedRequest === "직접입력"
                            ? splitAddress(orderData[0].customRequest, 30)
                            : splitAddress(orderData[0].selectedRequest, 30),
                      }}
                      style={{ marginLeft: "98px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="delivery-box">
            <h2>결제 정보</h2>

            <div className="detail-delivery-info">
              <div className="detail-user-info">
                <div className="detail-box">
                  <div className="detail-info-name">
                    <p>최종 결제 금액</p>
                    {orderItems.length > 0 ? (
                      <div className="detail-price-item">
                        <div className="order-detail-content">
                          {/* 각 상품의 금액을 합산한 값을 출력 */}
                          <p style={{ marginLeft: "78px" }}>
                            {new Intl.NumberFormat("ko-KR").format(
                              finalPayment
                            )}
                            원 {/* ✅ 최종 결제 금액 반영 */}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p>주문이 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-info-point">
                    <p>포인트 할인</p>
                    <p style={{ marginLeft: "97px" }}>
                      {new Intl.NumberFormat("ko-KR").format(usedPoints)} P{" "}
                      {/* ✅ 사용한 포인트 금액 반영 */}
                    </p>
                  </div>
                </div>

                {/* ✅ 적립된 포인트 정보 추가 */}
                <div className="detail-box">
                  <div className="detail-info-point-earned">
                    <p>적립된 포인트</p>
                    <p
                      style={{
                        marginLeft: "83px",
                        color: "green",
                        fontWeight: "bold",
                      }}
                    >
                      {new Intl.NumberFormat("ko-KR").format(earnedPoints)} P
                    </p>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-info-delivery">
                    <p>배송비</p>
                    <p style={{ marginLeft: "130px" }}>0 원</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
