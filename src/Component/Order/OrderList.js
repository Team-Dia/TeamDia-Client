import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import Modal from "react-modal";
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import jaxios from '../../util/jwtUtil';
import './OrderList.css';

const OrderList = () => {

    const [formData, setFormData] = useState({
            memberAddress1: "",
            memberAddress2: "",
            zipNum: "",
    });
    const { state } = useLocation();  // location에서 state 객체 가져오기
    const navigate = useNavigate();
    const { product,} = state; // 
    const { orderItems, loginUser } = state; // 전달된 product와 user 정보
    const [errors, setErrors] = useState({});
    console.log('loginUser:',loginUser);  // 유저 정보 확인
    console.log('생성된 orderItems:',orderItems); // 상품 정보 확인
    
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [isDefaultAddress, setIsDefaultAddress] = useState(true);  // 기본 주소를 사용할지 여부
    const [shippingAddress, setShippingAddress] = useState('');
    
    const [selectedRequest, setSelectedRequest] = useState('배송 전에 미리 연락 바랍니다'); // 드롭다운에서 선택된 값
    
    const [customRequest, setCustomRequest] = useState(''); // "직접입력" 시 사용자가 입력한 값
    const [recipientName, setRecipientName] = useState('');  // 받는 사람
    const [recipientPhone, setRecipientPhone] = useState('');  // 연락처

    const [nameError, setNameError] = useState('');  // 받는 사람 에러 상태
    const [phoneError, setPhoneError] = useState('');  // 연락처 에러 상태
    const [addressError, setAddressError] = useState('');  // 주소 에러 상태

    const [cartList, setCartList] = useState([]);
    const [checklist, setChecklist] = useState([]); // 체크된 항목 저장 배열

    // ✅ 추가된 상태 변수 (포인트 관련)
    const [usedPoints, setUsedPoints] = useState(0); // 사용자가 입력한 포인트
    const [finalAmount, setFinalAmount] = useState(0); // 최종 결제 금액
    const [userPoints, setUserPoints] = useState(0); // 현재 사용자의 보유 포인트

    // 받는 사람 입력 처리
        const handleRecipientNameChange = (e) => {
            setRecipientName(e.target.value);
        };

        // 연락처 입력 처리
        const handleRecipientContactChange = (e) => {
            setRecipientPhone(e.target.value);
        };

    // 드롭다운에서 값이 변경될 때 호출되는 함수
    const handleSelectChange = (e) => {
        const value = e.target.value;
        setSelectedRequest(value);
        if (value !== '직접입력') {
        setCustomRequest(''); // 직접입력을 선택하지 않으면 텍스트 필드를 비웁니다.
        }
    };

    // 직접입력 텍스트 필드에서 값이 변경될 때 호출되는 함수
    const handleCustomRequestChange = (e) => {
        setCustomRequest(e.target.value);
    };

    // ✅ 전체 주문 금액 계산
    const OrderPrice = orderItems.reduce((total, item) => total + item.totalPrice, 0);
    const totalPrice = orderItems.reduce((total, item) => total + (item.totalPrice || 0), 0);

    // 우편번호 검색 창 열기
    const openPostcodeModal = () => {
        setIsModalOpen(true);
    };

    // 우편번호 검색 창 닫기
    const closePostcodeModal = () => {
        setIsModalOpen(false);
    };

    // 우편번호 검색 결과 처리
    const handleAddressSelect = (data) => {
        let fullAddress = data.roadAddress;
        let extraAddress = '';

        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
        }
        if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? ', ' : '') + data.buildingName;
        }
        if (extraAddress !== '') {
            fullAddress += ` (${extraAddress})`;
        }

        // 기본 주소가 아닌 새로운 주소 입력 시, shippingAddress 상태 변경
        if (!isDefaultAddress) {
            setShippingAddress(fullAddress);
        }

        setFormData({
            ...formData,
            zipNum: data.zonecode, // 우편번호
            memberAddress1: fullAddress, // 기본 주소
            memberAddress2: '', // 상세 주소
        });
        
        closePostcodeModal(); // 모달 닫기
    };

    // ✅  체크리스트 업데이트 로그 확인
    useEffect(() => {
        console.log("✅ 업데이트된 checklist:", checklist);
    }, [checklist]);

    // ✅ [수정됨] 체크박스 선택 시 체크리스트 업데이트
    const handleCheck = (cartSeq, checked) => {
        setChecklist(prevChecklist => {
            const updatedChecklist = checked
                ? [...prevChecklist, cartSeq]
                : prevChecklist.filter(seq => seq !== cartSeq);

            console.log("📝 체크리스트 업데이트:", updatedChecklist);
            return updatedChecklist;
        });
    };

    const fetchCartList = async () => {
        try {
            const result = await jaxios.get('/api/cart/getCartList', {
                params: { memberId: loginUser.memberId }
            });
            console.log('🛒 장바구니 데이터 업데이트:', result.data); // ✅ API 응답 확인
            setCartList(result.data);
        } catch (err) {
            console.error('장바구니 목록을 가져오는 중 오류:', err);
        }
    };

     // 주문을 API에 보내는 함수
     const createOrder = async () => {
        console.log("🛒 최종 삭제할 항목 (checklist):", checklist); // ✅ 최신 checklist 값 확인

        let isValid = true;

        // 에러 초기화
        setNameError('');
        setPhoneError('');
        setAddressError('');

        // 배송지 정보 결합 (우편번호 포함)
        const fullShippingAddress = isDefaultAddress
            ? `${formData.zipNum} ${formData.memberAddress1} ${formData.memberAddress2}` // 기본 주소
            : `${formData.zipNum} ${formData.memberAddress1} ${formData.memberAddress2}`; // 새 주소      
        if (!loginUser) {
            setError('유저 정보가 없습니다.');
            return;
        }
        // 유효성 검사
        if (!recipientName) {
            setNameError('받는 사람을 입력해주세요.');
            isValid = false;
        }
        if (!recipientPhone) {
            setPhoneError('연락처를 입력해주세요.');
            isValid = false;
        }
        // 배송주소 유효성 검사
    if (!fullShippingAddress || fullShippingAddress.trim() === "") {
        setAddressError('배송주소를 입력해주세요.'); // 새로운 에러 메시지 설정
        isValid = false;
    }
        if (!isValid) return;
        try {
            setIsLoading(true);
            setError(null);
            // 주문 데이터 준비 (각 상품마다 개별 주문 데이터 생성)
            const orderData = orderItems.map(item => ({
                memberId: loginUser.memberId,
                
                productSeq: item.productSeq,  // ✅ 올바르게 item을 사용
                sizeValue: item.sizeValue,  // ✅ 올바르게 item을 사용
                quantity: item.quantity,  // ✅ 올바르게 item을 사용
                totalPrice: item.totalPrice,  // ✅ 올바르게 item을 사용
                shippingAddress: fullShippingAddress,
                // 사용자 입력 데이터
                name: recipientName,
                phone: recipientPhone,
                address: fullShippingAddress,
                selectedRequest: selectedRequest,  // selectedRequest 상태 값 사용
                customRequest: selectedRequest === '직접입력' ? customRequest : '',  // '직접입력'일 때만 customRequest 값 추가
                isDefaultAddress: isDefaultAddress, // 기본 배송지로 등록 여부
                usedPoints: usedPoints // ✅ 추가된 필드
            }));
    
            // API 호출 (POST 요청)
            const response = await jaxios.post('/api/orders/createOrders', orderData);
            console.log('orderData',orderData);
    
            if (response.status === 200) {
                alert('주문이 완료되었습니다!');

                // ✅ 주문 완료 후 장바구니에서 해당 상품 삭제
                // for (const cartSeq of checklist) {
                //     await axios.delete(`/api/cart/deletecart/${cartSeq}`);
                // }
                console.log("🛒 삭제할 항목 (checklist):", checklist);
                await Promise.all(checklist.map(cartSeq =>
                    jaxios.delete(`/api/cart/deletecart/${cartSeq}`)
                        .then(response => console.log(`✅ 삭제 성공: ${cartSeq}`, response.data))
                        .catch(error => console.error(`❌ 삭제 실패: ${cartSeq}`, error))
                ));


                // ✅ 주문 완료 후 장바구니 상태 업데이트
                setCartList(prevCartList => prevCartList.filter(cart => !checklist.includes(cart.cartSeq)));

                // ✅ 체크리스트 초기화
                setChecklist([]);

                // ✅ 최신 장바구니 데이터 불러오기 (백엔드 반영)
                fetchCartList();

                // ✅ 주문 완료 후 상세 페이지로 이동
                navigate('/orderDetail', { state: { orderData,orderItems } });
            }
        } catch (err) {
            setError('주문 처리에 실패했습니다. 다시 시도해 주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setIsDefaultAddress(checked);  // 체크박스 상태 업데이트
    
        if (checked) {
            // 체크박스를 체크하면 기본 배송지로 돌아가도록
            setShippingAddress('');  // 새 배송지 입력 상태로 변경
            setFormData({
                ...formData,
                zipNum: formData.zipNum,  // 기본 우편번호 유지
                memberAddress1: formData.memberAddress1,  // 기본 주소1 유지
                memberAddress2: formData.memberAddress2,  // 기본 주소2 유지
            });
        } else {
            // 체크박스를 해제하면 기본 주소를 초기화
            setShippingAddress('');  // 새 배송지 입력 상태로 변경
            setFormData({
                ...formData,
                zipNum: '', // 우편번호 초기화
                memberAddress1: '', // 주소1 초기화
                memberAddress2: '', // 주소2 초기화
            });
        }
    };
    
    
    
    // useEffect 수정
    useEffect(() => {
        if (loginUser) {
            setFormData({
                ...formData,
                memberAddress1: loginUser.memberAddress1,
                memberAddress2: loginUser.memberAddress2,
                zipNum: loginUser.zipNum,
            });
        }
    }, [loginUser]);

    useEffect(() => {
        if (isDefaultAddress && loginUser) {
            setFormData({
                ...formData,
                memberAddress1: loginUser.memberAddress1,
                memberAddress2: loginUser.memberAddress2,
                zipNum: loginUser.zipNum,
            });
        }
    }, [isDefaultAddress, loginUser]);

    // ✅ 로그인한 사용자의 보유 포인트 설정
    useEffect(() => {
        if (loginUser) {
            setUserPoints(loginUser.points || 0); // 보유 포인트 설정
        }
        setFinalAmount(totalPrice); // 초기 결제 금액 설정
    }, [loginUser]);

    // ✅ usedPoints가 변경될 때 최종 결제 금액을 업데이트
    useEffect(() => {
        setFinalAmount(totalPrice - usedPoints); // 포인트 차감 반영
    }, [usedPoints, totalPrice]);

    // ✅ 포인트 입력 시 처리
    const handlePointChange = (e) => {
        let inputPoints = parseInt(e.target.value) || 0;

        if (inputPoints > userPoints) {
            alert('보유한 포인트를 초과할 수 없습니다.');
            inputPoints = userPoints;
        } else if (inputPoints > totalPrice) {
            alert('결제 금액을 초과하여 포인트를 사용할 수 없습니다.');
            inputPoints = totalPrice;
        }

        setUsedPoints(inputPoints);
        setFinalAmount(totalPrice - inputPoints);
    };
    


  
    return (
    <div className='order-container'>
        <div className='order-header'>
            <h1>결제하기</h1>
            <div className='order-header-right'>
                <p style={{display:'flex',alignItems:'center',color:' rgb(155, 155, 155)'}}>장바구니&nbsp;<i className="ri-play-circle-fill"></i></p>&nbsp;&nbsp;
                <p style={{display:'flex',alignItems:'center'}}>결제하기&nbsp;<i className="ri-play-circle-fill"></i></p>&nbsp;&nbsp;
                <p style={{color:' rgb(155, 155, 155)'}}>주문완료</p>
            </div>
        </div>


        {isLoading && <p>주문을 처리하는 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className='order-product-header'>
            <p style={{fontSize:'25px', fontWeight:'bold'}}>구매 상품</p>
            <div className='order-product-right'>
                <p>수량</p>
                <p>할인혜택</p>
                <p>주문금액</p>
            </div>
        </div>

        {orderItems.map((item, index) => (
            <div className='order-product-info' key={index}>
                <div className='order-image-box'>
                <img src={`http://localhost:8070/product_images/${item.productImage}`} />
                <div className='order-product-detail'>
                    <div>{item.productName}</div>
                    <p style={{color:'rgb(155, 155, 155)'}}>옵션: {item.sizeValue}</p>
                    <div>{new Intl.NumberFormat('ko-KR').format(item.totalPrice)}원</div>

                </div>
                </div>
                <div className='order-info-right'>
                <p>{item.quantity}개</p>
                <p>쿠폰적용</p>
                <div>{new Intl.NumberFormat('ko-KR').format(item.totalPrice)}원</div>

                </div>
            </div>
        ))}

        <div className='order-total-price'>
            <div style={{color:'rgb(155, 155, 155)'}}>상품&nbsp;{OrderPrice} + 배송비 0 = &nbsp;</div>
            <div>{totalPrice}</div>
        </div>

        <div className='order-info-detail'>

            <div className='order-info-box'>
                <h2>주문자 정보</h2>&nbsp;
                <p style={{color:'rgb(254, 79, 0)'}}>이름 (필수)</p>
                <p>{loginUser.memberName}</p>
                <p style={{color:'rgb(254, 79, 0)'}}>이메일 (필수)</p>
                <p>{loginUser.memberEmail}</p>&nbsp;&nbsp;&nbsp;

                <div className='order-delivery'>

                    <h2>배송지 정보</h2>&nbsp;

                    <p id='input-info'>받는 사람*</p>&nbsp;
                        <div className='input-wrapper-box' style={{ position: 'relative' }}>
                            <input 
                                type='text' 
                                placeholder='이름을 입력해주세요' 
                                value={recipientName} 
                                onChange={(e) => setRecipientName(e.target.value)}
                                style={{ paddingRight: '2rem' }}  // 오른쪽에 공간을 추가하여 에러 메시지가 겹치지 않도록 함
                            />
                            {nameError && (
                                <p style={{ 
                                    position: 'absolute', 
                                    right: '0', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    color: 'red', 
                                    fontSize: '0.8rem', 
                                    margin: '0'
                                }}>
                                    {nameError}
                                </p>
                            )}
                        </div>
                        &nbsp;

                    <p>연락처*</p>&nbsp;
                    <div className='input-wrapper-box' style={{ position: 'relative' }}>
                        <input 
                            type='text' 
                            placeholder='번호를 입력해주세요' 
                            value={recipientPhone} 
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            style={{ paddingRight: '2rem' }}  // 오른쪽에 공간을 추가하여 에러 메시지가 겹치지 않도록 함
                        />
                        {phoneError && (
                            <p style={{ 
                                position: 'absolute', 
                                right: '0', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'red', 
                                fontSize: '0.8rem', 
                                margin: '0'
                            }}>
                                {phoneError}
                            </p>
                        )}
                    </div>
                    &nbsp;

                    <p>배송 주소*</p>&nbsp;
                        <div className='input-wrapper-box' style={{ position: 'relative' }}>
                            <div className='order-btn'>
                                <input 
                                    type="text" 
                                    name="zipNum" 
                                    placeholder="우편번호" 
                                    value={formData.zipNum} 
                                    readOnly
                                    style={{ paddingRight: '2rem' }}  // 오른쪽에 공간을 추가하여 에러 메시지가 겹치지 않도록 함
                                />
                                <button type='button' onClick={openPostcodeModal}>검색</button>
                            </div>

                            &nbsp;

                            <input 
                                type="text" 
                                name="memberAddress1" 
                                placeholder="기본 주소" 
                                value={formData.memberAddress1} 
                                readOnly
                                style={{ paddingRight: '2rem' }}  // 오른쪽에 공간을 추가하여 에러 메시지가 겹치지 않도록 함
                            />

                            &nbsp;

                            <input 
                                type="text" 
                                name="memberAddress2" 
                                style={{ marginTop: '5px', paddingRight: '2rem' }} 
                                placeholder="상세 주소 (예: 101동 202호)" 
                                value={formData.memberAddress2} 
                                onChange={(e) => setFormData({ ...formData, memberAddress2: e.target.value })}
                            />
                            {addressError && (
                                <p 
                                    style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '80%',
                                        transform: 'translateY(-50%)',
                                        color: 'red',
                                        fontSize: '0.8rem',
                                        margin: '0'
                                    }}
                                >
                                    {addressError}
                                </p>
                            )}
                        </div>


                    {isModalOpen && (
                        <>
                            <div className="zip-modal-overlay" onClick={closePostcodeModal}></div>
                            <div className="zip-modal-content">
                                <DaumPostcode onComplete={handleAddressSelect} />
                                <button onClick={closePostcodeModal} className="zip-modal-close-btn">닫기</button>
                            </div>
                        </>
                                    )}
                    {errors.zipNum && <p className="register-error">{errors.zipNum}</p>}

                    <div className='delivery-checkbox'>
                        <input 
                            type='checkbox' 
                            id='option1' 
                            name='option' 
                            checked={isDefaultAddress}
                            onChange={handleCheckboxChange} 
                        />
                        <label htmlFor='option1' style={{fontWeight:'600', fontSize:'15px', marginTop:'10px'}}>
                            기본 배송지
                        </label>
                    </div>


                    <div className="delivery-request-container">

                        <select 
                            value={selectedRequest} 
                            onChange={handleSelectChange} 
                            className="dropdown"
                        >
                            <option value="배송 전에 미리 연락 바랍니다">배송 전에 미리 연락 바랍니다</option>
                            <option value="문 앞에 놓고 가주세요">문 앞에 놓고 가주세요</option>
                            <option value="부재시 경비실에 맡겨주세요">부재시 경비실에 맡겨주세요</option>
                            <option value="부재시 전화 주시거나 문자 주세요">부재시 전화 주시거나 문자 주세요</option>
                            <option value="직접입력">직접입력</option>
                        </select>

                        {selectedRequest === '직접입력' && (
                            <div className="custom-input-container">
                            
                            <input 
                                type="text" 
                                id="customRequest" 
                                value={customRequest} 
                                onChange={handleCustomRequestChange} 
                                placeholder="상세 요청사항을 입력해 주세요. (최대 50자)"
                                maxLength={50}  // 50자 이상 입력할 수 없도록 설정
                            />
                            </div>
                        )}
                    </div>

                    <button style={{marginTop:'30px',border:'none',width:'100%',height:'48px',background:'black',color:'white',fontWeight:'bold',fontSize:'16px',cursor:'pointer'}} 
                            onClick={createOrder} disabled={isLoading}>결제하기
                    </button>

                </div>
            </div>



            <div className='order-final-price'>
                <h3>최종 결제 금액</h3>
                <div className='final-info'>
                    <div className='final-detail'>
                        <p>주문상품 금액</p>
                        <div>{new Intl.NumberFormat('ko-KR').format(totalPrice)}원</div>
                    </div>

                    <div className='final-detail'>
                        <p>배송비</p>
                        <p>0</p>
                    </div>

                    <div className='final-detail'>
                        <p>제주/도서산간 배송비</p>
                        <p>0</p>
                    </div>

                    {/* ✅ 포인트 입력 필드 추가 */}
                    <div className='final-detail'>
                        <p>포인트 사용</p>
                        <input 
                            type="number" 
                            value={usedPoints} 
                            onChange={handlePointChange} 
                            placeholder="사용할 포인트 입력" 
                            style={{ width: '100px', textAlign: 'right' }}
                        />
                        <p>/ {userPoints.toLocaleString()} P</p>
                    </div>
                </div>

                <div className='final-purchase'>
                    <p style={{fontSize:'18px',fontWeight:'bold'}}>총 결제금액</p>
                    <p style={{ color: 'rgb(98, 0, 240)', fontSize: '25px', fontWeight: 'bold' }}>
                        {new Intl.NumberFormat('ko-KR').format(finalAmount)}원
                    </p>

                </div>

                
            </div>

        </div>
        
        

        
    </div>
  )
}

export default OrderList
