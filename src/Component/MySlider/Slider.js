import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Slider.css';
import jaxios from "../../util/jwtUtil";


const MainSlider = ({ isLoggedIn, memberId }) => {
  const [popularItems, setPopularItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [errorPopular, setErrorPopular] = useState(null);
  const [errorRecommended, setErrorRecommended] = useState(null);

  // 인기 상품 가져오기
  useEffect(() => {
    axios.get("/api/product/popular-items")
      .then(response => {
        if (response.status === 204) {
          console.log('No popular products found.');
          setPopularItems([]);
        } else {
          setPopularItems(response.data);
        }
      })
      .catch(error => setErrorPopular(error))
      .finally(() => setLoadingPopular(false));
  }, []);

// 추천 상품 가져오기 (로그인된 사용자만)
useEffect(() => {
  if (!isLoggedIn || !memberId) return; // 로그인되지 않은 경우 실행하지 않음
  
  // jaxios 사용 (JWT 토큰을 자동으로 처리함)
  jaxios.get(`/api/product/recommendations?memberId=${memberId}`)
    .then(response => {
      if (response.status === 204) {
        console.log('추천할 상품이 없습니다.');
        setRecommendedItems([]);
      } else {
        console.log('추천 상품 데이터:', response.data);
        setRecommendedItems(response.data);
      }
    })
    .catch(error => {
      console.error('추천 상품 로딩 오류:', error);
      setErrorRecommended(error);
    })
    .finally(() => setLoadingRecommended(false));
}, [isLoggedIn, memberId]);

  const settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
  };

  // 로딩 상태 표시
  if (loadingPopular || (isLoggedIn && loadingRecommended)) return <div>Loading...</div>;
  if (errorPopular || (isLoggedIn && errorRecommended)) return <div>Error loading data.</div>;

  return (
    <div>
      {/* 비로그인 상태: 인기 상품 슬라이더 */}
      {!isLoggedIn && (
        <div className="autoplay">
          <Slider {...settings}>
            {popularItems.length > 0 ? (
              popularItems.map((item, index) => (
                <div className="slider-item" key={index}>
                  <Link to={`/producDetail/${item.productSeq}`} className="slider-link">
                    <div className="image-container">
                      <img src={`http://localhost:8070/product_images/${item.productImage}`} alt={item.productName} className="slide-product-image" />
                      <div className="badge">인기 상품</div>
                      <div className="overlay">
                        <div className="slide-product-info">
                          <div className="slide-product-name">{item.productName}</div>
                          <div className="slide-product-price">₩ {new Intl.NumberFormat("ko-KR").format(item.productSalePrice)} 원</div>
                        </div>
                      </div>
                     <div className="slide-product-link">상품 바로가기</div>  {/* 상품 바로가기 버튼 */}
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="slider-item">
                <img src="/imgs/no-popular.jpg" alt="No popular products" />
              </div>
            )}
          </Slider>
        </div>
      )}

      {/* 로그인 상태: 추천 상품 슬라이더 */}
      {isLoggedIn && (
        <div className="autoplay">
          <Slider {...settings}>
            {recommendedItems.length > 0 ? (
              recommendedItems.map((item, index) => (
                <div className="slider-item" key={index}>
                  <Link to={`/producDetail/${item.productSeq}`} className="slider-link">
                    <div className="image-container">
                      <img src={`http://localhost:8070/product_images/${item.productImage}`} alt={item.productName} className="slide-product-image" />
                      <div className="badge" style={{left: '21%'}}>{memberId}님 추천상품</div>
                      <div className="overlay">
                        <div className="slide-product-info">
                          <div className="slide-product-name">{item.productName}</div>
                          <div className="slide-product-price">₩ {new Intl.NumberFormat("ko-KR").format(item.productSalePrice)} 원</div>
                        </div>
                      </div>
                      <div className="slide-product-link">상품 바로가기</div>  {/* 상품 바로가기 버튼 */}
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="slider-item">
                <img src="/imgs/no-recommendation.jpg" alt="No recommended products" />
              </div>
            )}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default MainSlider;
