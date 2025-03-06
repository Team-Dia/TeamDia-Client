import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jaxios from '../../util/jwtUtil';
import '../../style/cart.css';

const Cartlist = () => {
    const [cartList, setCartList] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const loginUser = useSelector(state => state.user);
    const navigate = useNavigate();
    const [checklist, setChecklist] = useState([]); // 체크된 항목 저장 배열
    const [sizeList, setSizeList] = useState([]);  // 여러 사이즈를 관리하는 배열
    const [quantityList, setQuantityList] = useState({});
    const [product, setProduct] = useState({});

    useEffect(() => {
        if (!loginUser.memberId) {
            alert('로그인이 필요한 서비스입니다');
            navigate('/login');
        } else {
            fetchCartList();
        }
    }, [loginUser, navigate]);

    const fetchCartList = async () => {
        try {
            const result = await jaxios.get('/api/cart/getCartList', {
                params: { memberId: loginUser.memberId }
            });
            console.log('🛒 장바구니 데이터:', result.data); // API 응답 확인
            if (Array.isArray(result.data)) {  // 응답 데이터가 배열인지 확인
                setCartList(result.data);
                calculateTotalPrice(result.data);
            } else {
                console.error("장바구니 데이터가 배열이 아닙니다:", result.data);
            }
        } catch (err) {
            console.error('장바구니 목록을 가져오는 중 오류:', err);
        }
    };
    

    const calculateTotalPrice = (cartItems) => {
        const total = cartItems.reduce((sum, cart) => sum + (cart.quantity * cart.productSalePrice), 0);
        setTotalPrice(total);
    };

    const handleOrder = async () => {
        if (checklist.length === 0) {
            alert('주문할 항목을 선택하세요');
            return;
        }
        // 주문 확인 메시지 띄우기
        const isConfirmed = window.confirm('선택한 상품을 주문하시겠습니까?');
        if (!isConfirmed) {
            return; // 사용자가 취소를 선택하면 주문을 중단
        }
        try {
            const orderItems = checklist.map(cartSeq => {
                const cartItem = cartList.find(cart => cart.cartSeq === cartSeq);
                return {
                    memberId: loginUser.memberId,
                    productSeq: cartItem.productSeq,
                    productName: cartItem.productName,
                    productImage: cartItem.productImage,
                    sizeValue: cartItem.sizeValue,
                    quantity: cartItem.quantity,
                    totalPrice: cartItem.quantity * cartItem.productSalePrice,
                    shippingAddress: "배송지 입력 필요"
                };
            });
    
            console.log("📌 생성된 주문 데이터:", orderItems);
    
            // ✅ 주문서 작성 페이지로 이동하기 전 알림 메시지 추가
            alert('주문서 작성 페이지로 이동합니다.');

            // ✅ 주문 내역 페이지로 이동 (API 호출 없이 데이터만 전달)
            navigate('/orderList', { state: { loginUser, orderItems, checklist } });
            
        } catch (err) {
            console.error('주문 처리 중 오류:', err);
            alert('주문 처리 중 오류가 발생했습니다.');
        }
    };
    

    const handleDeleteCart = async () => {
        if (checklist.length === 0) {
            alert('삭제할 항목을 선택하세요');
            return;
        }

        if (!window.confirm('선택한 항목을 삭제할까요?')) { return; }

        try {
            for (const cartSeq of checklist) {
                await jaxios.delete(`/api/cart/deletecart/${cartSeq}`);
            }
            // ✅ 삭제 후 프론트에서 상태 업데이트 (즉시 반영)
            setCartList(prevCartList => {
                const updatedCartList = prevCartList.filter(cart => !checklist.includes(cart.cartSeq));
    
                // ✅ 삭제 후 총 금액도 업데이트
                const newTotalPrice = updatedCartList.reduce(
                    (sum, cart) => sum + (cart.quantity * cart.productSalePrice),0
                );
                setTotalPrice(newTotalPrice);
    
                return updatedCartList;
            });
            // ✅ 삭제 후 체크리스트 초기화
            setChecklist([]);
        } catch (err) {
            console.error('장바구니 항목 삭제 중 오류:', err);
        }
    };

    const handleCheck = (cartSeq, checked) => {
        setChecklist(prevChecklist => {
            if (checked) {
                return [...prevChecklist, cartSeq];
            } else {
                return prevChecklist.filter(seq => seq !== cartSeq);
            }
        });
    };

    // ✅ 상품명을 클릭하면 해당 상품의 상세 페이지로 이동
    const goToProductDetail = (productSeq) => {
        navigate(`/producDetail/${productSeq}`);
    };

    // orderOne 함수 정의
    const orderOne = () => {
        if (!loginUser || !loginUser.memberId) {
        alert("로그인이 필요합니다.");
        navigate('/login');
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
        navigate('/orderList', {
        state: { 
            loginUser,
            orderItems, // 주문할 상품 리스트 전달
        }
        });
    };



    return (
        <article>
            <div className='subPage'>
                <div className='cartList'>
                    <h2>장바구니</h2>
                    {cartList.length > 0 ? (
                        <div className="tb">
                            <div className="row">
                                <div className="coltitle">상품 이미지</div>
                                <div className="coltitle">상품명</div>
                                <div className="coltitle">옵 션</div>
                                <div className="coltitle">수 량</div>
                                <div className="coltitle">가 격</div>
                                <div className="coltitle">선 택</div>
                            </div>
                            {cartList.map((cart, idx) => (
                                <div className="row" key={cart.cartSeq}>
                                    {/* 상품이미지 추가 */}
                                    <img src={`http://localhost:8070/product_images/${cart.productImage}`} 
                                        alt={cart.productName} 
                                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                    />
                                    {/* ✅ 상품명을 클릭하면 상세 페이지로 이동 */}
                                    <span 
                                        className="product-link" 
                                        onClick={() => goToProductDetail(cart.productSeq)}
                                    >
                                            {cart.productName}
                                    </span>
                                    <div className="col">{cart.sizeValue}</div>
                                    <div className="col">{cart.quantity}</div>
                                    <div className="col">
                                        {new Intl.NumberFormat('ko-KR').format(cart.quantity * cart.productSalePrice)}
                                    </div>
                                    <div className="col">
                                        <input
                                            type="checkbox"
                                            id={`ch${idx}`}
                                            value={cart.cartSeq}
                                            onChange={(e) => handleCheck(cart.cartSeq, e.target.checked)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="row">
                                <div className="col" style={{ backgroundColor: "blue", color: "white", flex: "2" }}> 총 액</div>
                                <div className="col" style={{ flex: "2", textAlign: "left" }}>
                                    &nbsp;&nbsp;&nbsp;{new Intl.NumberFormat('ko-KR').format(totalPrice)}
                                </div>
                                <div className="col" style={{ flex: "1" }}>
                                    <button onClick={handleDeleteCart}>삭제</button>
                                </div>
                            </div>
                            <div className="btn" style={{ display: "flex" }}>
                                <button
                                    style={{ flex: "1", background: "blue", padding: "10px", color: "white", margin: "3px" }}
                                    onClick={() => navigate('/')}
                                >
                                    쇼핑 계속하기
                                </button>
                                <button style={{ flex: "1", background: "blue", padding: "10px", color: "white", margin: "3px" }}
                                    onClick={handleOrder}  // ✅ 불필요한 중괄호 제거
                                >
                                    주문하기
                                </button>
                            </div>
                        </div>
                    ) : (
                        <h3>장바구니가 비었습니다.</h3>
                    )}
                </div>
            </div>
        </article>
    );
};

export default Cartlist;
