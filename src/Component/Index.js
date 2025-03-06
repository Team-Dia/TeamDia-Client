import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jaxios from '../util/jwtUtil';
import '../style/index.css';

const Index = () => {
  const [bestProduct, setBestProduct] = useState([]);
  const [newProduct, setNewProduct] = useState([]);
  const [userData, setUserData] = useState(null); // ✅ 회원 정보 상태 추가
  const navigate = useNavigate();
  const memberId = useSelector((state) => state.user.memberId); // ✅ Redux에서 memberId 가져오기

  const handleImageHover = (e, imageUrl) => {
    e.target.src = imageUrl;
  };

  const [hoveredProductId, setHoveredProductId] = useState(null);

  const handleMouseEnter = (productId, hoverImage) => {
    setHoveredProductId(productId);
  };

  const handleMouseLeave = () => {
    setHoveredProductId(null);
  };

  // ✅ 회원 정보 가져오기
  useEffect(() => {
    if (!memberId) {
      console.error("❌ memberId가 없음! 요청을 보내지 않음.");
      return;
    }

    axios.get("/api/member/userinfo", {
        headers: {
            "Authorization": memberId, // ✅ `Authorization`에 `memberId` 포함
        },
        withCredentials: true
    })
    .then(response => {
        console.log("✅ 서버에서 받아온 회원 정보:", response.data);
        setUserData(response.data.loginUser); // ✅ 회원 정보 상태 업데이트
    })
    .catch(error => console.error("❌ 회원 정보 가져오기 실패:", error));
  }, [memberId]); // ✅ memberId 변경 시 다시 요청

  
  // ✅ 상품 정보 가져오기
  useEffect(() => {
    axios.get('/api/product/bestPro')
      .then((result) => {
        console.log("📌 [베스트 상품] 응답 데이터:", result.data.bestProduct);
        setBestProduct(result.data.bestProduct);
        
        // ✅ bestProduct가 배열인지 확인
        if (Array.isArray(result.data.bestProduct)) {
          console.log("✅ [프론트] bestProduct 개수:", result.data.bestProduct.length);
          setBestProduct(result.data.bestProduct);
      } else {
          console.error("❌ [프론트] bestProduct가 배열이 아님:", result.data.bestProduct);
      }


      })
      .catch((err) => {
        console.error("❌ 베스트 상품 가져오기 실패:", err);
      });

    axios.get('/api/product/newPro')
      .then((result) => {
        setNewProduct(result.data.newProduct);
      })
      .catch((err) => {
        console.error("❌ 신상품 가져오기 실패:", err);
      });
  }, []);


  return (
    <div className='main-container'>

        <div className='main-category'>
            <Link to='/best' id='best-link'>
                <img src='./imgs/a.jpg'/>
                <p>베스트</p>
            </Link>

            <Link to='/new' id='best-link'>
                <img src='./imgs/e.jpg'/>
                <p>신상품</p>
            </Link>

            <Link to='/ring' id='best-link'>
                <img src='./imgs/d.jpg'/>
                <p>반지</p>
            </Link>

            <Link to='/necklace' id='best-link'>
                <img src='./imgs/c.jpg'/>
                <p>목걸이</p>
            </Link>

            <Link to='/earring' id='best-link'>
                <img src='./imgs/b.jpg'/>
                <p>귀걸이</p>
            </Link>
        </div>
      
      <h1>&nbsp;BEST PRODUCT&nbsp;</h1>

    <div className='itemlist'>
        {bestProduct ? (
            bestProduct.map((product, idx) => {
                return (
                    <div className='item' key={idx}>
                        <div className='index-product-image'>
                        <Link to={`/producDetail/${product.productSeq}`}>
                                <div className="image-container"
                                    onMouseEnter={() => handleMouseEnter(product.productSeq, product.hoverImage)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <img className="index-product-image"
                                    src={`http://localhost:8070/product_images/${product.productImage}`}
                                    alt={product.name}
                                    onMouseEnter={(e) => handleImageHover(e, `http://localhost:8070/product_hover/${product.hoverImage}`)}
                                    onMouseLeave={(e) => handleImageHover(e, `http://localhost:8070/product_images/${product.productImage}`)}
                                    />
                                    {/* 퀵뷰 텍스트는 이미지 영역 내부에 위치 */}
                                    {hoveredProductId === product.productSeq && (
                                    <div className="quickview">상품 바로가기</div>
                                    )}
                                </div>
                            </Link>
                            <div className='name' style={{marginLeft:'10px'}}>{product.productName}</div>&nbsp;
                            <div className='pro-price' style={{marginLeft:'10px'}}>
                              {new Intl.NumberFormat('ko-KR').format(product.productCostPrice)}원
                            </div>&nbsp;
                        </div>
                    </div>
                )
            })
        ) : (<div>Loading...</div>)}
    </div>


    

    <h1>&nbsp;NEW PRODUCT&nbsp;</h1>

    <div className='itemlist'>
        {newProduct ? (
            newProduct.map((product, idx) => {
                return (
                    <div className='item' key={idx}>
                        <div className='product-image'>
                        <Link to={`/producDetail/${product.productSeq}`}>
                            <div className="image-container"
                                onMouseEnter={() => handleMouseEnter(product.productSeq, product.hoverImage)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <img
                                src={`http://localhost:8070/product_images/${product.productImage}`}
                                alt={product.name}
                                onMouseEnter={(e) => handleImageHover(e, `http://localhost:8070/product_hover/${product.hoverImage}`)}
                                onMouseLeave={(e) => handleImageHover(e, `http://localhost:8070/product_images/${product.productImage}`)}
                                />
                                {/* 퀵뷰 텍스트는 이미지 영역 내부에 위치 */}
                                {hoveredProductId === product.productSeq && (
                                <div className="quickview">상품 바로가기</div>
                                )}
                            </div>
                            </Link>
                            <div className='name' style={{marginLeft:'10px'}}>{product.productName}</div>&nbsp;
                            <div className='pro-price' style={{marginLeft:'10px'}}>
                              {new Intl.NumberFormat('ko-KR').format(product.productCostPrice)}원
                            </div>&nbsp;
                        </div>
                    </div>
                )
            })
        ) : (<div>Loading...</div>)}
    </div>

    <Link to='/ring' id='all-link'>Shop All</Link>

</div>
  )
}

export default Index