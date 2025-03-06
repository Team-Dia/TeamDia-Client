import React, { useState, useEffect,useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import './ProducDetail.css';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { useNavigate,useParams } from 'react-router-dom';
import Modal from '../Modal/Modal';
import ProductInfoReview from '../review/ProductInfoReview';
import { useSelector, useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import jaxios from '../../util/jwtUtil';
import { useLocation } from 'react-router-dom';
import Footing from '../Footing/Footing';

const ProducDetail = () => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbsActiveIndex, setThumbsActiveIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState(null); // ✅ categoryId 상태 추가
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0); // 평균 별점 상태 추가
  
  const categoryOptions = {
    1: ["10호", "11호", "12호"], // 반지 (category_id: 1)
    2: ["40cm", "41cm", "42cm"], // 목걸이 (category_id: 2)
    3: ["옐로우골드", "로즈골드", "화이트골드"], // 귀걸이 (category_id: 3)
    4: ["17cm", "18cm", "19cm"] // 팔찌 (category_id: 4)
  };
  
  const handleOptionChange = (e) => {
    const option = e.target.value;
    if (!option) return;

    // ✅ 중복 추가 방지: 이미 sizeList에 존재하는지 확인
    setSizeList((prevList) => {
        if (prevList.includes(option)) {
            return prevList; // 기존 리스트 유지 (중복 방지)
        }
        return [...prevList, option]; // 새로운 옵션 추가
    });

    // ✅ 옵션별 수량을 관리하는 객체 업데이트 (기본값 1)
    setQuantityList((prevList) => ({
        ...prevList,
        [option]: prevList[option] || 1
    }));

    setSelectedOption(""); // ✅ 선택 후 옵션 초기화 (한 번만 추가되도록)
  };


  function ProductOptions({ categoryId, selectedOption, handleOptionChange }) {
    const options = categoryOptions[categoryId] || [];
    return (
      <div>
        <select value={selectedOption} onChange={handleOptionChange} className="size-select">
          <option value="">옵션 선택</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
  
        {/* 선택된 사이즈 표시 */}
        {selectedOption && (
          <div className='size-info'>
            <p style={{ marginTop: '15px' }}>{selectedOption}</p>
            <img 
              src='/imgs/deletebtn.png' 
              style={{ width: '20px', marginRight: '10px', marginTop: '15px', cursor: 'pointer' }} 
              onClick={() => handleOptionChange({ target: { value: "" } })} 
            />
          </div>
        )}
      </div>
    );
  }

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex); // 메인 이미지 activeIndex 업데이트
    if (thumbsSwiper) {
      thumbsSwiper.slideTo(swiper.activeIndex);  // 썸네일 슬라이드 이동
    }
  };

  const handleThumbsSlideChange = (swiper) => {
    setThumbsActiveIndex(swiper.activeIndex);
    if (thumbsSwiper) {
      thumbsSwiper.slideTo(swiper.activeIndex);  // 썸네일에서 슬라이드하면 메인 이미지도 동기화
    }
  };

  const handleSizeChange = (e) => {
    const newSize = e.target.value;
    if (newSize && !sizeList.includes(newSize)) {
      setSizeList((prevList) => [...prevList, newSize]);
      setQuantityList((prevList) => [...prevList, { size: newSize, quantity: 1 }]); // 새로운 사이즈 추가
    }
  };

  const handleDeleteSize = (sizeToDelete) => {
    // 사이즈 삭제 시, 사이즈 리스트와 수량 리스트에서 해당 항목을 모두 삭제
    setSizeList((prevList) => prevList.filter(size => size !== sizeToDelete));
    // ✅ quantityList에서 해당 size 삭제 (객체 업데이트)
    setQuantityList((prevList) => {
      const updatedList = { ...prevList };
      delete updatedList[sizeToDelete];
      return updatedList;
    });
  };

  // 수량 변경을 위한 버튼 핸들러
  const handleIncrease = (size) => {
    setQuantityList((prevList) => ({
      ...prevList,
      [size]: (prevList[size] || 1) + 1
    }));
  };
  
  const handleDecrease = (size) => {
    setQuantityList((prevList) => ({
      ...prevList,
      [size]: Math.max(1, (prevList[size] || 1) - 1)
    }));
  };

  // 수량 변경
  const handleQuantityChange = (size, e) => {
    const newQuantity = Number(e.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantityList((prevList) => ({
        ...prevList,
        [size]: newQuantity
      }));
    }
  };
  

  // ------------------------------------------------------------------------------------------------------

  const [productImages, setProductImages] = useState([]); // 이미지 데이터를 저장할 상태
  const {productSeq} = useParams();
  const [product, setProduct] = useState({});
  const [review,setReview] = useState([]);
  const [size, setSize] = useState('');
  const [quantity,setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [sizeList, setSizeList] = useState([]);  // 여러 사이즈를 관리하는 배열
  const [quantityList, setQuantityList] = useState({});
  const [likeList, setLikeList] = useState([])
  const dispatch = useDispatch()
  const cookies = new Cookies();
  const sizeQuantity = quantityList[size] ?? 1; // ✅ 기본값 1로 설정
  
  const basePrice = product.productSalePrice || 0;

  // ------------------------------------------------------------------------------------------------------


  // 모달 열기/닫기 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  // 클릭된 div에 따라 모달 내용 변경
  const openModal = (type) => {
    if (type === 'exchange') {
      setModalContent({
        title: '교환 및 반품 정보',
        content: '여기에는 교환 및 반품에 대한 정보가 들어갑니다.',
      });
    } else if (type === 'as') {
      setModalContent({
        title: 'A/S 정보',
        content: '여기에는 A/S에 대한 정보가 들어갑니다.',
      });
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // ------------------------------------------------------------------------------------------------------

  // 로그인 후 사용자가 좋아요한 목록을 가져오는 함수
  async function fetchUserLikes(productSeq = null) {
    if (loginUser && loginUser.memberId) {
      try {
        // 요청 파라미터 설정
        const params = {
          memberId: loginUser.memberId,
        };

        // productSeq가 있으면 해당 상품에 대한 좋아요만 조회
        if (productSeq) {
          params.productSeq = productSeq;
        }

        // 서버로 요청 보내기
        const response = await jaxios.get('/api/post/getUserLikes', { params });

        // 서버로부터 받은 좋아요 데이터에서 memberId를 적절히 처리
        const transformedData = response.data.map(item => ({
          ...item,
          memberId: item.member ? item.member.memberId : null, // memberId 추출
        }));

        // 상태에 좋아요 데이터 설정
        setLikeList(transformedData);
      } catch (error) {
        console.error('좋아요 목록을 가져오는 중 오류 발생:', error);
      }
    }
  }

  
  
  

  // redux에 저장된 로그인 유저 로딩
  const loginUser = useSelector(state => state.user);
    if (!loginUser || Object.keys(loginUser).length === 0) {
        console.log("사용자 정보가 로드되지 않았습니다.");
    } else {
        console.log(loginUser);
}

  const navigate = useNavigate();

  async function onLike() {
    if (!loginUser || !loginUser.memberId) {
        // 로그인하지 않은 상태일 때, 로그인 페이지로 리다이렉트
        navigate('/login');  // '/login' 페이지로 이동
        return;  // 더 이상 실행되지 않도록 반환
    }

    try {
        const isLiked = likeList.some(product_like => loginUser.memberId === product_like.memberId);

        if (!isLiked) {
            // 좋아요 추가 - 서버에 요청 (색칠되지 않은 상태일 때 추가)
            const response = await jaxios.post('/api/post/addLike', {
                memberId: loginUser.memberId,
                productSeq: productSeq,
            });
            console.log('좋아요 추가:', response.data);
            
            // 서버 응답 후 likeList에 새로운 아이템 추가
            setLikeList(prevList => [...prevList, { memberId: loginUser.memberId, productSeq }]);
        } else {
            // 좋아요 취소 - 서버에 요청 (색칠된 상태일 때 취소)
            const response = await jaxios.delete(`/api/post/removeLike?memberId=${loginUser.memberId}&productSeq=${productSeq}`);
            console.log('좋아요 취소:', response.data);
            
            // 서버 응답 후 likeList에서 해당 아이템 제거
            setLikeList(prevList => prevList.filter(product_like => product_like.memberId !== loginUser.memberId));
        }
    } catch (error) {
        console.error('좋아요 처리 중 오류 발생:', error);
    }
}


  // ------------------------------------------------------------------------------------------------------

  // ✅ 수량 변경 시, 총 가격 업데이트
  useEffect(() => {
    let updatedPrice = basePrice;

    // ✅ quantityList를 객체에서 배열로 변환 후 합산
    const totalQuantity = Object.values(quantityList).reduce((acc, quantity) => acc + quantity, 0);

    setTotalPrice(updatedPrice * totalQuantity);
  }, [quantityList, basePrice]);

  useEffect(() => {
    window.scrollTo(0, 0); // 페이지가 로드되면 스크롤을 맨 위로 이동
  }, []);

  useEffect(() => {
    // 로그인 정보가 변경될 때마다 업데이트
    if (loginUser && loginUser.memberId) {
      setUser(loginUser);  // Redux에서 가져온 로그인 정보를 상태에 반영
      console.log('로그인 정보 업데이트:', loginUser);
    }
  
    // productSeq가 존재하면 해당 상품에 대한 좋아요만 조회
    if (productSeq) {
      fetchUserLikes(productSeq);
    } else {
      fetchUserLikes();  // 전체 좋아요 목록을 가져오려면 그냥 호출
    }
  }, [loginUser, productSeq]);  // loginUser나 productSeq가 변경될 때마다 실행
  

  
  

  // 사이즈와 수량에 따른 가격 계산
  
  // ✅ 총 상품 금액 계산 (모든 옵션 합산)
  useEffect(() => {
    let updatedPrice = basePrice;

    // ✅ quantityList를 객체에서 배열로 변환 후 합산
    const totalQuantity = Object.values(quantityList).reduce((acc, quantity) => acc + quantity, 0);

    setTotalPrice(updatedPrice * totalQuantity);
  }, [quantityList, basePrice]);
  
  

  // 서버에서 이미지 데이터를 받아오는 함수
  
  useEffect(() => {
    
    axios.get(`/api/product/selectPro`, { params: { productSeq } })
      .then((result) => {
        console.log(result.data.productImages);
        setProductImages(result.data.productImages || []); // 서버에서 받은 데이터를 상태에 저장
      })
      .catch((err) => {
        console.error(err);
        setProductImages([]);
      });
  }, [productSeq]);

  useEffect(() => {
    axios.get(`/api/product/getProduct`, { params: { productSeq } })
      .then((result) => {
        if (result.data.product) {
          setProduct(result.data.product);
          // setCategoryName(result.data.product.categoryName); // ✅ 부모 카테고리 설정
          setCategoryId(result.data.product.categoryId); // ✅ categoryId 설정
          console.log("Loaded product:", result.data.product.categoryId); // 로드된 상품 확인
        } else {
          console.warn("상품 정보를 불러올 수 없습니다.");
        }
      })
      .catch((err) => {
        console.error("상품 정보를 불러오는 중 오류 발생:", err);
      });
  }, [productSeq]);

  useEffect(() => {
      jaxios.get(`/api/review/getReview`, {params:{productSeq}})
        .then((result) => {
          console.log("Loaded reviews:", result.data.review); // 로드된 댓글 확인
          setReview(result.data.review);
          setReviewCount(result.data.reviewCount); // 리뷰 갯수 설정
          setAverageRating(result.data.averageRating); // 평균 별점 설정
        })
        .catch((err) => {
          console.error(err);
        });
  }, [productSeq]); // productSeq가 변경될 때마다 호출


console.log('Product Seq:', productSeq); // productSeq 값 확인
console.log('Review Seq:', review); // reviewSeq 값 확인 (없을 수 있음)
console.log('CategoryName:', categoryName);




useEffect(() => {
  if (thumbsSwiper && productImages.length > 0) {
    thumbsSwiper.update();  // 썸네일 swiper 업데이트
    thumbsSwiper.slideTo(activeIndex);  // 메인 이미지의 activeIndex에 맞춰 썸네일 슬라이드 업데이트
  }
}, [activeIndex, thumbsSwiper, productImages]);

const goCart = async () => {
  if (!loginUser || !loginUser.memberId) {
    alert("로그인이 필요합니다.");
    navigate('/login');
    return;
  }
  if (sizeList.length === 0) {
    alert("옵션을 선택해주세요.");
    return;
  }
  try {
    console.log("장바구니 추가 시도");
    for (const size of sizeList) {
      const sizeQuantity = quantityList[size] ?? 1; // 옵션별 수량 가져오기

      console.log("jaxios 요청 전");

      const response = await jaxios.post('/api/cart/insertCart', null, {
        params: {
          productSeq: productSeq,
          memberId: loginUser.memberId,
          quantity: sizeQuantity,
          option: size, // ✅ 옵션 정보를 백엔드에 전달
        }
      });
      console.log("jaxios 요청 후", response);

      // 요청 전후의 헤더를 확인
console.log("Request Headers:", response.config.headers);  // 헤더 출력

if (response.data.msg === "ok") {
    console.log(`장바구니 추가 성공: ${size}`);
} else {
    console.warn(`장바구니 추가 실패: ${size}`);
}
    }

    if (window.confirm("장바구니에 추가되었습니다. 장바구니로 이동할까요?")) {
      navigate('/cartlist'); // ✅ 장바구니 페이지로 이동
    }
  } catch (error) {
    console.error("장바구니 추가 중 오류 발생:", error);
    alert("장바구니 추가에 실패했습니다.");
  }
};




const { productId } = useParams(); // URL에서 productId 가져오기

  // 최근 본 상품 출력 기능
  useEffect(() => {
    if (productSeq && product?.productName) { 
        let viewedProducts = JSON.parse(localStorage.getItem("viewedProducts")) || [];

        // 🔹 중복 제거 (같은 상품이 이미 존재하면 삭제)
        viewedProducts = viewedProducts.filter((p) => p.productSeq !== productSeq);

        // 🔹 새로운 상품을 배열의 맨 앞에 추가
        viewedProducts.unshift({
            productSeq: productSeq,
            productName: product.productName,
            productImage: product.productImage || "/images/default-placeholder.jpg",
            productPrice: product.productMarginPrice || 0,
        });

        // 🔹 최근 본 상품 최대 10개까지만 유지
        if (viewedProducts.length > 10) {
            viewedProducts.pop();
        }

        // 🔹 localStorage에 업데이트
        localStorage.setItem("viewedProducts", JSON.stringify(viewedProducts));

        // 🔹 MyPage에서 즉시 반영될 수 있도록 이벤트 발생
        window.dispatchEvent(new Event("recentlyViewedUpdated"));
    }
  }, [productSeq, product]);

  // orderOne 함수 정의
  const orderOne = () => {
    if (!loginUser || !loginUser.memberId) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
  
    if (sizeList.length === 0) {
      alert("옵션을 선택해주세요.");
      return;
    }
  
    // 주문할 상품 리스트 생성 (여러 옵션이 있는 경우)
    const orderItems = sizeList.map((size) => ({
      productSeq: product.productSeq,
      productName: product.productName,
      productImage: product.productImage,
      sizeValue: size, // 선택한 옵션(사이즈)
      quantity: quantityList[size] ?? 1, // 선택한 옵션의 수량
      totalPrice: (quantityList[size] ?? 1) * product.productSalePrice, // 개별 상품 총 가격
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
    <>
    <div className='product-detail'>

      <div className='product-allcontainer'>

      <div className="swiper-container">
      
        {/* 메인 이미지 Swiper */}
        <div className="swiper-wrapper">
          <Swiper
            style={{
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#fff',
            }}
            loop={false}  // 메인 이미지 순환 비활성화
            spaceBetween={10}
            onInit={(swiper) => {
              if (productImages.length > 0) {
                swiper.update();  // Swiper가 초기화될 때 이미지가 로드된 후 업데이트
              }
            }}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
              disabledClass: 'swiper-button-disabled',
            }}
            thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : null}  // 썸네일 Swiper와 메인 슬라이드 동기화
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper2"
            key={productImages.length}
          >
            {productImages.length > 0 ? (
                productImages.map((product, idx) => (
                  <>
                    {product.productImage && (
                    <SwiperSlide key={`${idx}-1`} className={activeIndex === idx ? 'active' : ''}>
                      <img src={`http://localhost:8070/product_images/${product.productImage}`} />
                    </SwiperSlide>
                  )}

                  {product.productImage2 && (
                    <SwiperSlide key={`${idx}-2`} className={activeIndex === idx + 1 ? 'active' : ''}>
                      <img src={`http://localhost:8070/product_images/${product.productImage2}`} />
                    </SwiperSlide>
                  )}

                  {product.productImage3 && (
                    <SwiperSlide key={`${idx}-3`} className={activeIndex === idx + 2 ? 'active' : ''}>
                      <img src={`http://localhost:8070/product_images/${product.productImage3}`} />
                    </SwiperSlide>
                  )}

                  {product.productImage4 && (
                    <SwiperSlide key={`${idx}-4`} className={activeIndex === idx + 3 ? 'active' : ''}>
                      <img src={`http://localhost:8070/product_images/${product.productImage4}`} />
                    </SwiperSlide>
                  )}
                </>
                ))
              ) : (
                <SwiperSlide>로딩 중...</SwiperSlide>
              )}

          </Swiper>
          
          {/* 화살표 버튼 */}
          <div className="swiper-button-prev" onClick={() => console.log('Prev Button Clicked')}></div>
          <div className="swiper-button-next" onClick={() => console.log('Next Button Clicked')}></div>

        </div>

        {/* 썸네일 Swiper */}
        <div className="wrapper2">
          <Swiper
            onSlideChange={(swiper) => setThumbsActiveIndex(swiper.activeIndex)}
            onSwiper={setThumbsSwiper}  // 썸네일 Swiper 초기화
            loop={false}  // 썸네일도 순환하도록 설정
            spaceBetween={20}
            slidesPerView={5}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper"
          >
            {productImages.length > 0 ? (
                productImages.map((product, idx) => (
                  <>
                    {product.productImage && (
                      <SwiperSlide key={`${idx}-1`} className={thumbsActiveIndex === idx ? 'active' : ''} >
                        <img src={`http://localhost:8070/product_images/${product.productImage}`} />
                      </SwiperSlide>
                    )}

                    {product.productImage2 && (
                      <SwiperSlide key={`${idx}-2`} className={thumbsActiveIndex === idx + 1 ? 'active' : ''} >
                        <img src={`http://localhost:8070/product_images/${product.productImage2}`} />
                      </SwiperSlide>
                    )}

                    {product.productImage3 && (
                      <SwiperSlide key={`${idx}-3`} className={thumbsActiveIndex === idx + 2 ? 'active' : ''} >
                        <img src={`http://localhost:8070/product_images/${product.productImage3}`} />
                      </SwiperSlide>
                    )}

                    {product.productImage4 && (
                      <SwiperSlide key={`${idx}-4`} className={thumbsActiveIndex === idx + 3 ? 'active' : ''} >
                        <img src={`http://localhost:8070/product_images/${product.productImage4}`} />
                      </SwiperSlide>
                    )}
                  </>
                ))
              ) : (
                <SwiperSlide>로딩 중...</SwiperSlide>
              )}
          </Swiper>
        </div>

      <div className="Return-info">
        &nbsp;&nbsp;
        <div onClick={() => openModal('exchange')}>▶ 교환 및 반품 정보</div>
        &nbsp;
        <div onClick={() => openModal('as')}>▶ A/S 정보</div>
      </div>

      {/* 모달 컴포넌트 */}
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={modalContent.title}
        content={modalContent.content}
      />

    </div>

      <div className='product-info'>
          <div className='brandname'>

            
            <div className='interest-info'>
              <span style={{display:'flex', justifyContent:'center',alignItems:'center', width:'65px', height:'30px', background:'black',color:'white',fontWeight:'bold',fontSize:'13px'}}>무료배송</span>
              <div className='like'>
                {
                  likeList.some(product_like => loginUser.memberId === product_like.memberId) ? (
                    <img
                      src={`http://localhost:8070/product_images/delike.png`}  
                      onClick={() => { onLike() }} 
                      alt="Like"
                    />
                  ) : (
                    <img 
                      src={`http://localhost:8070/product_images/like.png`} 
                      onClick={() => { onLike() }} 
                      alt="Like" 
                    />
                  )
                }
              </div>


            </div>

          <div className='product-content'>
            <span style={{ fontSize:'25px',fontWeight:'bold'}}>{product.productName}</span>

            <div className="rating-container">
                {/* 별점 표시 */}
                  <div className="stars">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const isFullStar = index < Math.floor(averageRating); // 완전한 별
                      const isHalfStar = index === Math.floor(averageRating) && averageRating % 1 >= 0.5; // 반별
                      const isEmptyStar = index >= Math.ceil(averageRating); // 빈 별

                      return (
                        <span
                          key={index}
                          style={{
                            color: isFullStar
                              ? '#FFD700' // 완전한 별
                              : isHalfStar
                              ? '#FFD700' // 반별 (반응형 색상)
                              : '#000000', // 빈 별
                            fontSize: '22px',
                            fontWeight: 'bold',
                            marginRight: '3px',
                            marginTop: '2px',
                          }}
                        >
                          {isFullStar || isHalfStar ? '★' : '☆'} {/* '★'은 완전한 별, '☆'는 빈 별 */}
                        </span>
                      );
                    })}
                  </div>


                {/* 후기 갯수와 링크 */}
                <a
                  href="#reviews-section"  // 후기 세션으로 바로 이동
                  style={{
                    display:'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    textDecoration: 'none',
                    marginLeft: '10px',
                    marginTop: '5px',
                  }}
                >
                  {reviewCount}개의 후기 보러가기<i className="ri-arrow-right-s-fill" style={{fontSize:'20px'}}></i>
                </a>
              </div>

              <div className='product-price' style={{marginTop:'15px'}}>
              <span style={{ fontSize: '30px', fontWeight: 'bold' }}>
                {new Intl.NumberFormat('ko-KR').format(product.productSalePrice)}원
              </span>

              </div>

              <div className='delivery-info'>
                <span style={{ fontSize:'18px',fontWeight:'bold'}}>배송정보</span>

                <div className='delivery-icon'>
                  <i className="ri-truck-line" style={{fontSize:'25px'}}></i>
                  &nbsp;&nbsp;<span style={{fontWeight:'bold'}}>일반 배송</span>
                </div>

                <span style={{marginLeft:'34px'}}>평균 3일 내 배송 (주말, 공휴일 제외)</span>
              </div>

              {/* ✅ 부모 카테고리가 설정된 후에 옵션 선택 UI를 렌더링 */}
              {categoryId && (
                <ProductOptions
                  categoryId={categoryId}
                  selectedOption={selectedOption}
                  handleOptionChange={handleOptionChange}
                />
              )}
              {selectedOption && (
                <div className="quantity-wrapper">
                  <div className="quantity-info">
                    <div className="quantity-detail">
                      {/* - 버튼 클릭 시 수량 감소 */}
                      <button type="button" className="quantity-btn" onClick={() => handleDecrease(size)}>&minus;</button>
                      {/* 수량 입력창 */}
                      <input
                        type="number"
                        id="quantity"
                        value={sizeQuantity}
                        onChange={(e) => handleQuantityChange(size, e)}
                        className="quantity-input"
                        min="1"
                      />
                      <button type="button" className="quantity-btn" onClick={() => handleIncrease(size)}>+</button>
                    </div>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '15px', marginRight: '10px' }}>
                      {sizeQuantity * basePrice}원
                    </p>
                  </div>
                </div>
              )}
              
              {/* 사이즈 선택 */}
              {/* <div className='select-option'>
                 <ProductOptions size={size} handleSizeChange={handleSizeChange} setSize={setSize}/>
              </div> */}

        {/* 선택된 사이즈 표시 */}
        {sizeList.map((size, idx) => {
            const sizeQuantity = quantityList[size] ?? 1; // ✅ 안전하게 값 가져오기

            return (
              <div key={idx} className='size-quantity-wrapper'>
                <div className='size-info'>
                  <p style={{ marginTop: '15px' }}>&nbsp;&nbsp;&nbsp;&nbsp;{size}</p>
                  <img
                    src='/imgs/deletebtn.png'
                    style={{ width: '20px', marginRight: '10px', marginTop: '15px', cursor: 'pointer' }}
                    onClick={() => handleDeleteSize(size)} // 삭제 버튼 클릭 시 해당 사이즈만 삭제
                  />
                </div>

                {/* 수량 및 가격 조정 */}
                <div className="quantity-info">
                  <div className="quantity-detail">
                    {/* - 버튼 클릭 시 수량 감소 */}
                    <button type="button" className="quantity-btn" onClick={() => handleDecrease(size)}>&minus;</button>

                    {/* 수량 입력창 */}
                    <input
                      type="number"
                      id="quantity"
                      value={sizeQuantity}
                      onChange={(e) => handleQuantityChange(size, e)}
                      className="quantity-input"
                      min="1"  // 최소 1로 제한
                    />

                    {/* + 버튼 클릭 시 수량 증가 */}
                    <button type="button" className="quantity-btn" onClick={() => handleIncrease(size)}>+</button>
                  </div>

                  <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '15px', marginRight: '10px' }}>
                    {new Intl.NumberFormat('ko-KR').format(sizeQuantity * basePrice)}&nbsp;원
                  </p>

                </div>
              </div>
            );
          })}



              {/* 총 가격 표시 */}
              <div className="price-info">
                <p style={{fontSize: '15px', fontWeight: 'bold'}}>총 상품 금액</p>
                <p style={{ fontSize: '26px', fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('ko-KR').format(totalPrice)}원
                </p>

              </div>

            <div className='shopping-select'>
              <button style={{background:'rgb(225, 225, 225)'}}  onClick={()=>{ goCart() }}>장바구니</button>
              &nbsp;&nbsp;
              <button style={{color:'white',background:'black'}} onClick={()=>{orderOne();}}>구매하기</button>
            </div>
          </div>
          
        </div>
        
    </div>
    </div>
    <ProductInfoReview review={review} />
    
          
  </div>
</>

  );
}

export default ProducDetail