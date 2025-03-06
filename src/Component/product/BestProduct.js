import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BestProduct.css';

const BestProduct = () => {

  const [selectedTab, setSelectedTab] = useState('detail'); // 'detail'이 기본 선택된 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열기/닫기 상태
  const [sortOption, setSortOption] = useState('신상품순'); // 기본 정렬 기준
  const [sortedBest, setSortedBest] = useState([]); // 정렬된 리뷰 상태 (빈 배열로 초기화)
  const [bestProduct, setBestProduct] = useState([]); // 상품 목록 상태

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

  // 탭 클릭 시 상태 업데이트
  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 정렬 기준 선택
  const handleSortOptionClick = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false); // 메뉴 닫기
    sortProducts(option); // 선택한 기준으로 리뷰 정렬
  };

  // 상품 정렬 함수
  const sortProducts = (option) => {
    let sortedData = [...bestProduct]; // 원본 배열을 복사하여 정렬을 진행합니다.

    switch (option) {
      case '신상품순':
        sortedData.sort((a, b) => new Date(b.indate) - new Date(a.indate)); // 최신순
        break;
      case '별점 높은 순':
        sortedData.sort((a, b) => b.averageRating - a.averageRating); // 높은 별점 순
        break;
      case '리뷰 많은 순':
        sortedData.sort((a, b) => b.reviewCount - a.reviewCount); // 리뷰 많은 순
        break;
      case '가격 낮은 순':
        sortedData.sort((a, b) => a.productSalePrice - b.productSalePrice); // 가격 낮은 순
        break;
      case '가격 높은 순':
        sortedData.sort((a, b) => b.productSalePrice - a.productSalePrice); // 가격 높은 순
        break;
      default:
        break;
    }

    setSortedBest(sortedData); // 정렬된 데이터를 상태에 업데이트
  };

  useEffect(() => {
    if (bestProduct && bestProduct.length > 0) {
      sortProducts('신상품순'); // 처음 로딩 시 '신상품순'으로 정렬
    }
  }, [bestProduct]);

  // ✅ 상품 정보 가져오기
  useEffect(() => {
    axios.get('/api/product/bestPro')
      .then((result) => {
        const products = result.data.bestProduct || []; // 

        
        const productPromises = products.map(product =>
          axios.get(`/api/review/getReview`, { params: { productSeq: product.productSeq } })
            .then(res => ({
              ...product,
              averageRating: res.data.averageRating || 0, 
              reviewCount: res.data.reviewCount || 0 
            }))
            .catch(() => ({
              ...product,
              averageRating: 0,
              reviewCount: 0
            }))
        );

        
        Promise.all(productPromises).then(updatedProducts => {
          setBestProduct(updatedProducts); // 
          setSortedBest(updatedProducts); // 
        });
      })
      .catch((err) => {
        console.error("❌ 베스트 상품 가져오기 실패:", err);
      });
  }, []);



  return (
    <div className='bestProduct-container'>
        
        <div className='bestProduct-header'>
            <img src='./imgs/bestproduct.jpg' />
            <div className='bestProduct-header-text'>
                <p style={{ fontSize: '20px' }}>BEST JEWELRY</p>&nbsp;
                <h1>가장 사랑받는 주얼리</h1>
            </div>
        </div>

        <div className='bestProduct-content'>
            <div className='bestProduct-content-header'>
                <p>100개의 아이템</p>
            </div>

            {/* 드롭다운 메뉴 */}
            <div className='best-drop-container'>
              <div className='best-st-btn' onClick={toggleDropdown}>
                {sortOption}{' '}
                <span
                  className={`arrow ${isDropdownOpen ? 'open' : ''}`}
                >
                  <i className='ri-arrow-down-s-line' style={{ fontSize: '20px' }}></i>
                </span>
              </div>

              {isDropdownOpen && (
                <div className='best-drop-menu'>
                  <div
                    className='active'
                    onClick={() => handleSortOptionClick('신상품순')}
                  >
                    신상품순
                  </div>

                  <div onClick={() => handleSortOptionClick('별점 높은 순')}>
                    별점 높은 순
                  </div>
                  
                  <div onClick={() => handleSortOptionClick('리뷰 많은 순')}>
                    리뷰 많은 순
                  </div>
                  
                  <div onClick={() => handleSortOptionClick('가격 낮은 순')}>
                    가격 낮은 순
                  </div>
                  
                  <div onClick={() => handleSortOptionClick('가격 높은 순')}>
                    가격 높은 순
                  </div>
                </div>
              )}
            </div>
        </div>

        <div className='best-pro-item'>
            <div className='best-item-list'>
                    {sortedBest.length > 0 ? (  // sortedBest.length로 확인
                        sortedBest.map((product, idx) => {  // sortedBest로 정렬된 데이터 사용
                            return (
                                <div className='item' key={idx}>
                                    <div className='index-product-image'>
                                    <Link to={`/producDetail/${product.productSeq}`}>
                                            <div className="image-container"
                                                onMouseEnter={() => handleMouseEnter(product.productSeq, product.hoverImage)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <img className="best-pro-image"
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
                                        {/* ⭐ 별점 및 리뷰 개수 표시 */}
                                    <div className="best-dis-rating" style={{marginTop:'5px'}}>
                                      <div className="best-stars">
                                          {Array.from({ length: 5 }).map((_, index) => (
                                              <span key={index} className={`best-star ${index < Math.round(product.averageRating) ? "full" : "empty"}`} 
                                                    style={{ fontSize: '25px' }}>★</span>
                                          ))}
                                      </div>
                                        <span className="best-review-ct" style={{marginRight:'15px'}}>REVIEW {product.reviewCount}</span>
                                    </div>
                                        <div className='name' style={{marginLeft:'10px'}}>{product.productName}</div>&nbsp;
                                        <div className='pro-price' style={{marginLeft:'10px'}}>{new Intl.NumberFormat('ko-KR').format(product.productSalePrice)}원</div>&nbsp;
                                    </div>
                                </div>
                            )
                        })
                    ) : (<div>Loading...</div>)}
                </div>
          </div>
    </div>
  )
}

export default BestProduct;
