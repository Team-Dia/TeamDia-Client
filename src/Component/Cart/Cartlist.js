import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import jaxios from "../../util/jwtUtil";
import "../../style/cart.css";

const Cartlist = () => {
  const [cartList, setCartList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const loginUser = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState([]); // 체크된 항목 저장 배열
  const [sizeList, setSizeList] = useState([]); // 여러 사이즈를 관리하는 배열
  const [quantityList, setQuantityList] = useState({});
  const [product, setProduct] = useState({});

  // ✅ 기존 데이터와 S3 데이터를 구분하여 이미지 표시
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/no-image.png"; // 기본 이미지 처리

    // ✅ S3 URL인지 확인
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // ✅ 기존 로컬 서버 이미지 경로를 S3 URL로 변경
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/product_images/${imagePath}`;
  };

  useEffect(() => {
    if (!loginUser.memberId) {
      alert("로그인이 필요한 서비스입니다");
      navigate("/login");
    } else {
      fetchCartList();
    }
  }, [loginUser, navigate]);

  // 체크리스트나 카트 리스트가 변경될 때마다 총합 계산
  useEffect(() => {
    calculateTotalPrice();
  }, [checklist, cartList]);

  const fetchCartList = async () => {
    try {
      const result = await jaxios.get("/api/cart/getCartList", {
        params: { memberId: loginUser.memberId },
      });
      console.log("🛒 장바구니 데이터:", result.data); // API 응답 확인
      if (Array.isArray(result.data)) {
        // 응답 데이터가 배열인지 확인
        setCartList(result.data);
        // 초기에는 체크리스트가 비어있으므로 여기서 calculateTotalPrice 호출하지 않음
      } else {
        console.error("장바구니 데이터가 배열이 아닙니다:", result.data);
      }
    } catch (err) {
      console.error("장바구니 목록을 가져오는 중 오류:", err);
    }
  };

  const calculateTotalPrice = () => {
    const total = cartList
      .filter((cart) => checklist.includes(cart.cartSeq)) // 체크된 상품만 필터링
      .reduce((sum, cart) => sum + cart.quantity * cart.productSalePrice, 0); // 합계 계산
    setTotalPrice(total);
  };

  const handleOrder = async () => {
    if (checklist.length === 0) {
      alert("주문할 항목을 선택하세요");
      return;
    }
    // 주문 확인 메시지 띄우기
    const isConfirmed = window.confirm("선택한 상품을 주문하시겠습니까?");
    if (!isConfirmed) {
      return; // 사용자가 취소를 선택하면 주문을 중단
    }
    try {
      const orderItems = checklist.map((cartSeq) => {
        const cartItem = cartList.find((cart) => cart.cartSeq === cartSeq);
        return {
          memberId: loginUser.memberId,
          productSeq: cartItem.productSeq,
          productName: cartItem.productName,
          productImage: cartItem.productImage,
          sizeValue: cartItem.sizeValue,
          quantity: cartItem.quantity,
          totalPrice: cartItem.quantity * cartItem.productSalePrice,
          shippingAddress: "배송지 입력 필요",
        };
      });

      console.log("📌 생성된 주문 데이터:", orderItems);

      // ✅ 주문서 작성 페이지로 이동하기 전 알림 메시지 추가
      alert("주문서 작성 페이지로 이동합니다.");

      // ✅ 주문 내역 페이지로 이동 (API 호출 없이 데이터만 전달)
      navigate("/orderList", { state: { loginUser, orderItems, checklist } });
    } catch (err) {
      console.error("주문 처리 중 오류:", err);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteCart = async () => {
    if (checklist.length === 0) {
      alert("삭제할 항목을 선택하세요");
      return;
    }

    if (!window.confirm("선택한 항목을 삭제할까요?")) {
      return;
    }

    try {
      for (const cartSeq of checklist) {
        await jaxios.delete(`/api/cart/deletecart/${cartSeq}`);
      }
      // ✅ 삭제 후 프론트에서 상태 업데이트 (즉시 반영)
      setCartList((prevCartList) => {
        const updatedCartList = prevCartList.filter(
          (cart) => !checklist.includes(cart.cartSeq)
        );
        return updatedCartList;
      });
      // ✅ 삭제 후 체크리스트 초기화
      setChecklist([]);
    } catch (err) {
      console.error("장바구니 항목 삭제 중 오류:", err);
    }
  };

  const handleCheck = (cartSeq, checked) => {
    setChecklist((prevChecklist) => {
      const updatedChecklist = checked
        ? [...prevChecklist, cartSeq]
        : prevChecklist.filter((seq) => seq !== cartSeq);
      return updatedChecklist;
    });
    // 여기서 calculateTotalPrice를 호출하지 않음 - useEffect에서 자동으로 처리됨
  };

  // ✅ 상품명을 클릭하면 해당 상품의 상세 페이지로 이동
  const goToProductDetail = (productSeq) => {
    navigate(`/producDetail/${productSeq}`);
  };

  // orderOne 함수 정의
  const orderOne = () => {
    if (!loginUser || !loginUser.memberId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 주문할 상품 리스트 생성 (여러 옵션이 있는 경우)
    const orderItems = sizeList.map((size) => ({
      productSeq: product.productSeq,
      productName: product.productName,
      productImage: product.productImage,
      sizeValue: size, // 선택한 옵션(사이즈)
      quantity: quantityList[size] ?? 1, // 선택한 옵션의 수량
      totalPrice: (quantityList[size] ?? 1) * product.productMarginPrice, // 개별 상품 총 가격
    }));
    console.log("📌 생성된 orderItems:", orderItems); // ✅ 로그 추가

    // OrderList 페이지로 데이터 전달
    navigate("/orderList", {
      state: {
        loginUser,
        orderItems, // 주문할 상품 리스트 전달
      },
    });
  };

  return (
    <article>
      <div className="subPage">
        <div className="cartlist-container">
          <div className="cartlist-header">
            <h1>장바구니</h1>
            <div className="cartlist-header-right">
              <p style={{ display: "flex", alignItems: "center" }}>
                장바구니&nbsp;<i className="ri-play-circle-fill"></i>
              </p>
              &nbsp;&nbsp;
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "rgb(155, 155, 155)",
                }}
              >
                결제하기&nbsp;<i className="ri-play-circle-fill"></i>
              </p>
              &nbsp;&nbsp;
              <p style={{ color: "rgb(155, 155, 155)" }}>주문완료</p>
            </div>
          </div>

          {cartList.length > 0 ? (
            <>
              <div className="cartlist-product-header">
                <p style={{ fontSize: "22px", fontWeight: "bold" }}>
                  상품 정보
                </p>
                <div className="cartlist-product-right">
                  <p>수량</p>
                  <p>할인혜택</p>
                  <p>주문금액</p>
                </div>
              </div>

              <div className="cartlist-table">
                {cartList.map((cart, idx) => (
                  <div className="cartlist-row" key={cart.cartSeq}>
                    <div className="cartlist-product-info">
                      <input
                        className="cartlist-checkbox"
                        type="checkbox"
                        id={`ch${idx}`}
                        value={cart.cartSeq}
                        checked={checklist.includes(cart.cartSeq)}
                        onChange={(e) =>
                          handleCheck(cart.cartSeq, e.target.checked)
                        }
                      />
                      <img
                        className="cartlist-product-image"
                        src={getImageUrl(cart.productImage)} // ✅ S3 URL 적용
                        // src={`http://localhost:8070/product_images/${cart.productImage}`}
                        alt={cart.productName}
                      />
                      <div className="cartlist-product-detail">
                        <span
                          className="cartlist-product-link"
                          onClick={() => goToProductDetail(cart.productSeq)}
                        >
                          {cart.productName}
                        </span>
                        <p className="cartlist-product-option">
                          옵션: {cart.sizeValue}
                        </p>
                        <div className="cartlist-product-price">
                          {new Intl.NumberFormat("ko-KR").format(
                            cart.quantity * cart.productSalePrice
                          )}
                          원
                        </div>
                      </div>
                    </div>
                    <div className="cartlist-info-right">
                      <p>{cart.quantity}개</p>
                      <p>쿠폰적용</p>
                      <div>
                        {new Intl.NumberFormat("ko-KR").format(
                          cart.quantity * cart.productSalePrice
                        )}
                        원
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cartlist-total-price">
                <div className="cartlist-total-price-label">
                  상품&nbsp;{new Intl.NumberFormat("ko-KR").format(totalPrice)}{" "}
                  + 배송비 0 = &nbsp;
                </div>
                <div>{new Intl.NumberFormat("ko-KR").format(totalPrice)}원</div>
              </div>

              <div className="cartlist-button-container">
                <button
                  className="cartlist-button cartlist-delete-button"
                  onClick={handleDeleteCart}
                >
                  선택 상품 삭제
                </button>
                <button
                  className="cartlist-button cartlist-continue-shopping"
                  onClick={() => navigate("/")}
                >
                  쇼핑 계속하기
                </button>
                <button
                  className="cartlist-button cartlist-order-button"
                  onClick={handleOrder}
                >
                  주문하기
                </button>
              </div>
            </>
          ) : (
            <h3>장바구니가 비었습니다.</h3>
          )}
        </div>
      </div>
    </article>
  );
};

export default Cartlist;
