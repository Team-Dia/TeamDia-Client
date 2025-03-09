import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './Slider.css';
import { Link } from 'react-router-dom'; // Link 추가

const MainSlider = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);  // 로딩 상태 추가
  const [error, setError] = useState(null);  // 오류 상태 추가

  // 인기 상품을 서버에서 가져오는 함수
  useEffect(() => {
    console.log('Fetching popular items based on order quantity in the last 30 days...');
    axios.get("/api/product/popular-items")
      .then(response => {
        if (response.status === 204) {
          console.log('No popular products found for the last 30 days.');
        } else {
          console.log('Popular products:', response.data);
          setPopularItems(response.data);  // 상태 업데이트
        }
      })
      .catch(error => {
        console.error('Error fetching popular products:', error);
        setError(error);  // 오류 상태 업데이트
      })
      .finally(() => {
        setLoading(false);  // 데이터 로딩 후 로딩 상태 해제
      });
  }, []);
  
  

  const settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
  };

  // 로딩 상태 표시
  if (loading) {
    return <div>Loading...</div>;  // 로딩 상태 표시
  }

  // 오류 상태 표시
  if (error) {
    return <div>Error: {error}</div>;  // 오류 표시
  }

  return (
    <div className="autoplay">
  <Slider {...settings}>
    {popularItems.length > 0 ? (
      popularItems.map((item, index) => (
        <div className="slider-item" key={index}>
          <Link to={`/producDetail/${item.productSeq}`} className="slider-link">
            <div className="image-container">
              <img
                src={`http://localhost:8070/product_images/${item.productImage}`}  // 서버 이미지 경로
                alt={item.productName}
                className="slide-product-image"
              />
              <div className="badge">인기 상품</div> {/* 배지 추가 */}
              <div className="overlay">
                <div className="slide-product-info">
                  <div className="slide-product-name">{item.productName}</div>
                  <div className="slide-product-price">
                    ₩ {new Intl.NumberFormat("ko-KR").format(item.productSalePrice)} 원
                  </div>
                </div>
              </div>
              <div className="slide-product-link">상품 바로가기</div>  {/* 상품 바로가기 버튼 */}
            </div>
          </Link>
        </div>
      ))
    ) : (
      <div className="slider-item">
        <img src="/imgs/loading.jpg" alt="Loading..." />
      </div>
    )}
  </Slider>
</div>


  );
};

export default MainSlider;
