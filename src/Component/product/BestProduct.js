import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate,useLocation } from 'react-router-dom';
import './BestProduct.css';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import jaxios from '../../util/jwtUtil';
import { loginAction } from "../../store/userSlice"; // Redux 액션 추가

const BestProduct = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('detail'); // 'detail'이 기본 선택된 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열기/닫기 상태
  const [sortOption, setSortOption] = useState('신상품순'); // 기본 정렬 기준
  const [sortedBest, setSortedBest] = useState([]); // 정렬된 리뷰 상태 (빈 배열로 초기화)
  const [bestProduct, setBestProduct] = useState([]); // 상품 목록 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalCount, setTotalCount] = useState(0); // 전체 상품 개수
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 개수
  const [likeList, setLikeList] = useState([]); // 좋아요 목록 상태
  const {productSeq} = useParams();
  
  // 로그인된 유저 상태를 Redux에서 가져옴
  const loginUser = useSelector(state => state.user);
  console.log('로그인 정보 업데이트:', loginUser);
  

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

const navigate = useNavigate();
const location = useLocation();

// ✅ localStorage에서 로그인 정보 가져오기
    const getStoredUser = () => {
        const storedUserStr = localStorage.getItem("loginUser");
        if (storedUserStr) {
            try {
                return JSON.parse(storedUserStr);
            } catch (error) {
                console.error("❌ 로그인 정보 파싱 오류:", error);
            }
        }
        return null;
    };

    // ✅ Redux 상태 업데이트를 기다린 후 로그인 여부 확인
    useEffect(() => {
      const storedUser = getStoredUser();
      if (storedUser?.memberId) {
          // 로그인 정보가 있을 경우 Redux 상태 업데이트
          console.log("✅ Redux 상태 업데이트: ", storedUser);
          dispatch(loginAction(storedUser));
      }
      // 로그인 정보가 없다면 그냥 리턴해서 로그인 페이지로 이동하지 않도록 처리
  }, [loginUser, dispatch, navigate]);
  

    useEffect(() => {
      console.log('likeList updated:', likeList);
    }, [likeList]);
    



const onLike = async (productSeq) => {
  if (!loginUser || !loginUser.memberId) {
    navigate('/login'); // 로그인하지 않으면 로그인 페이지로 이동
    return;
  }

  try {
    const isLiked = likeList.some(product_like => loginUser.memberId === product_like.memberId && product_like.productSeq === productSeq);  // 좋아요 상태 체크

    if (!isLiked) {
      // 좋아요 추가
      const response = await jaxios.post('/api/post/addLike', {
        memberId: loginUser.memberId,
        productSeq: productSeq,
      });

      // 상태 업데이트 (likeList에 해당 상품 추가)
      const updatedList = [...likeList, { memberId: loginUser.memberId, productSeq }];
      setLikeList(updatedList); // 상태 업데이트
      localStorage.setItem('likeList', JSON.stringify(updatedList));  // localStorage에 저장
    } else {
      // 좋아요 취소
      const response = await jaxios.delete(`/api/post/removeLike?memberId=${loginUser.memberId}&productSeq=${productSeq}`);

      // 상태 업데이트 (likeList에서 해당 상품 제거)
      const updatedList = likeList.filter(product_like =>
        !(product_like.memberId === loginUser.memberId && product_like.productSeq === productSeq)
      );
      setLikeList(updatedList); // 상태 업데이트
      localStorage.setItem('likeList', JSON.stringify(updatedList));  // localStorage에 저장
    }
  } catch (error) {
    console.error('좋아요 처리 중 오류 발생:', error);
  }
};
  
async function fetchUserLikes() {
  if (!loginUser?.memberId) return;
  if (loginUser && loginUser.memberId) {
      try {
          const params = {
              memberId: loginUser.memberId,
          };
          if (productSeq) {
              params.productSeq = productSeq;
          }
          // const response = await axios.get('/api/post/getUserLikes', { params });
          const response = await jaxios.get(`/api/post/getUserLikes?memberId=${loginUser.memberId}`, {
              headers: {
                  'Cache-Control': 'no-cache', // ✅ 캐싱 방지하여 최신 데이터 가져오기
              },
          });
          console.log("📡 서버 응답 데이터:", response.data); // ✅ 백엔드에서 데이터가 올바르게 오는지 확인

          // ✅ 서버에서 받은 데이터 변환 (memberId를 명확하게 추출)
          const transformedData = response.data.map(item => ({
              ...item,
              memberId: item.member ? item.member.memberId : null, // ✅ member 객체에서 memberId 추출
          }));
  
          console.log("✅ 최신 좋아요 목록 업데이트:", transformedData);
          setLikeList(transformedData);
      } catch (error) {
          console.error('좋아요 목록을 가져오는 중 오류 발생:', error);
      }
  }
}


 // ✅ 페이지 로드 시 최신 좋아요 목록 가져오기 (이전 데이터와 다를 경우에만)
    useEffect(() => {
        if (!loginUser?.memberId) return;
        fetchUserLikes();
    }, [loginUser.memberId]);   

  



  useEffect(() => {
    if (bestProduct && bestProduct.length > 0) {
      sortProducts('신상품순'); // 처음 로딩 시 '신상품순'으로 정렬
    }
  }, [bestProduct]);

  // ✅ 상품 정보 가져오기
  useEffect(() => {
    const limit = 20; // 한 페이지에 표시할 상품 개수
    axios.get(`/api/product/bestPro?page=${currentPage}&limit=${limit}`) // 현재 페이지와 limit 파라미터를 서버로 전송
      .then((result) => {
        const products = result.data.bestProduct || [];
        setBestProduct(products);
        setTotalCount(result.data.totalCount); // 전체 상품 개수
        setTotalPages(Math.ceil(result.data.totalCount / limit)); // 전체 페이지 개수 계산
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
          setBestProduct(updatedProducts); 
          setSortedBest(updatedProducts); 
        });
      })
      .catch((err) => {
        console.error("❌ 베스트 상품 가져오기 실패:", err);
      });
  }, [currentPage]); // currentPage가 바뀔 때마다 새로 데이터를 가져옵니다.

  // 페이지 이동 함수
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  

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
                <p>{totalCount} items</p> {/* 전체 아이템 수 표시 */}
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
    {sortedBest.length > 0 ? (  
      sortedBest.map((product, idx) => {  
        return (
          <div className='item' key={idx}>
            <div className='index-product-image'>
              {/* 상품 이미지 부분은 링크로 감싸서 이미지 클릭 시 상세페이지로 이동 */}
              <Link to={`/producDetail/${product.productSeq}`}>
                <div className="image-container"
                  onMouseEnter={() => handleMouseEnter(product.productSeq, product.hoverImage)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    className="best-pro-image"
                    src={`http://localhost:8070/product_images/${product.productImage}`}
                    alt={product.name}
                    onMouseEnter={(e) => handleImageHover(e, `http://localhost:8070/product_hover/${product.hoverImage}`)}
                    onMouseLeave={(e) => handleImageHover(e, `http://localhost:8070/product_images/${product.productImage}`)}
                  />
                </div>
              </Link>
              
              {/* 좋아요 버튼을 이미지 위에 절대 위치로 배치 */}
              <div 
                className="like-button" 
                onClick={(e) => { 
                  e.stopPropagation();  // Link 클릭을 막아서 상세페이지로 이동하지 않게 함
                  onLike(product.productSeq);  // 좋아요 기능 수행
                }}
              >
                <img
                  src={`http://localhost:8070/product_images/${likeList.some(product_like => product_like.productSeq === product.productSeq) ? 'delike.png' : 'like.png'}`}
                  alt={likeList.some(product_like => product_like.productSeq === product.productSeq) ? 'Liked' : 'Like'}
                  className="like-icon"
                />
              </div>
            </div>

            {/* 마우스 오버 시 상품 바로가기 텍스트 */}
            {hoveredProductId === product.productSeq && (
              <div className="quickview">상품 바로가기</div>
            )}

            {/* 나머지 상품 정보 표시 */}
            <div className="best-dis-rating" style={{ marginTop: '5px' }}>
              <div className="best-stars">
                {Array.from({ length: 5 }).map((_, index) => {
                  const isFullStar = index < Math.floor(product.averageRating);
                  const isHalfStar = index === Math.floor(product.averageRating) && product.averageRating % 1 >= 0.5;
                  const isEmptyStar = index >= Math.ceil(product.averageRating);

                  return (
                    <span
                      key={index}
                      className={`best-star ${isFullStar || isHalfStar ? "full" : "empty"}`}
                      style={{
                        fontSize: '25px',
                        color: isFullStar || isHalfStar ? '#FFD700' : '#000000',
                      }}
                    >
                      {isFullStar || isHalfStar ? '★' : '☆'}
                    </span>
                  );
                })}
              </div>
              <span className="best-review-ct" style={{ marginRight: '15px' }}>
                REVIEW {product.reviewCount}
              </span>
            </div>

            <div className='name' style={{ marginLeft: '10px' }}>{product.productName}</div>
            <div className='pro-price' style={{ marginLeft: '10px' }}>
              {new Intl.NumberFormat('ko-KR').format(product.productSalePrice)}원
            </div>&nbsp;
          </div>
        );
      })
    ) : (<div>Loading...</div>)}
  </div>
</div>





        {/* 페이지 네비게이션 */}
        <div className="pagination" style={{marginBottom:'120px',marginTop:'20px'}}>
            {Array.from({ length: totalPages }, (_, idx) => (
                <div 
                    key={idx + 1} 
                    className={`page-number ${currentPage === idx + 1 ? 'active' : ''}`} 
                    onClick={() => handlePageChange(idx + 1)}
                >
                    {idx + 1}
                </div>
            ))}
        </div>

    </div>
  );
}

export default BestProduct;
