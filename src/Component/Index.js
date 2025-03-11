import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import jaxios from "../util/jwtUtil";
import "../style/index.css";

const Index = () => {
  const [bestProduct, setBestProduct] = useState([]);
  const [newProduct, setNewProduct] = useState([]);
  const [userData, setUserData] = useState(null); // ✅ 회원 정보 상태 추가
  const navigate = useNavigate();
  const memberId = useSelector((state) => state.user.memberId); // ✅ Redux에서 memberId 가져오기

  // ✅  기존 데이터와 S3 데이터를 구분하여 이미지 표시
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/no-image.png"; // 기본 이미지 처리
  
    // ✅ S3 URL인지 확인
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // ✅ 기존 로컬 서버 이미지 경로 지원 (product_images 디렉토리)
    return `https://teamdia-file.s3.ap-northeast-2.amazonaws.com/product_images/${imagePath}`;
  };
  console.log("환경 변수 확인:", process.env.REACT_APP_ADMIN_URL);

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
    const limit = 8; // limit 값을 8로 설정

    // 베스트 상품 가져오기
    jaxios
      .get(`/api/product/bestPro?limit=${limit}`)
      .then((result) => {
        console.log("📌 [베스트 상품] 응답 데이터:", result.data.bestProduct);

        if (Array.isArray(result.data.bestProduct)) {
          console.log(
            "✅ [프론트] bestProduct 개수:",
            result.data.bestProduct.length
          );
          setBestProduct(result.data.bestProduct);
        } else {
          console.error(
            "❌ [프론트] bestProduct가 배열이 아님:",
            result.data.bestProduct
          );
        }
      })
      .catch((err) => {
        console.error("❌ 베스트 상품 가져오기 실패:", err);
        setBestProduct([]); // 에러 시 빈 배열로 초기화
      });

    // 신상품 가져오기
    jaxios
      .get(`/api/product/newPro?limit=${limit}`)
      .then((result) => {
        console.log("📌 [신상품] 응답 데이터:", result.data.newProduct);

        if (Array.isArray(result.data.newProduct)) {
          console.log(
            "✅ [프론트] newProduct 개수:",
            result.data.newProduct.length
          );
          setNewProduct(result.data.newProduct);
        } else {
          console.error(
            "❌ [프론트] newProduct가 배열이 아님:",
            result.data.newProduct
          );
        }
      })
      .catch((err) => {
        console.error("❌ 신상품 가져오기 실패:", err);
        setNewProduct([]); // 에러 시 빈 배열로 초기화
      });
  }, []); // useEffect의 두 번째 인자에 빈 배열 넣어서 최초 렌더링 시 한 번만 실행되도록

  return (
    <div className="main-container">
      <div className="main-category">
        <Link to="/bestProduct" id="best-link">
          <img src="./imgs/a.jpg" />
          <p>베스트</p>
        </Link>

        <Link to="/newProduct" id="best-link">
          <img src="./imgs/e.jpg" />
          <p>신상품</p>
        </Link>

        <Link to="/ring" id="best-link">
          <img src="./imgs/d.jpg" />
          <p>반지</p>
        </Link>

        <Link to="/necklace" id="best-link">
          <img src="./imgs/c.jpg" />
          <p>목걸이</p>
        </Link>

        <Link to="/earRing" id="best-link">
          <img src="./imgs/b.jpg" />
          <p>귀걸이</p>
        </Link>
      </div>
      <h1 className="best-title">DIAMONZ 추천 아이템</h1>

      <div className="itemlist">
        {bestProduct.length > 0 ? (
          bestProduct.map((product, idx) => {
            return (
              <div className="item" key={idx}>
                <div className="index-product-image">
                  <Link to={`/producDetail/${product.productSeq}`}>
                    <div
                      className="image-container"
                      onMouseEnter={() =>
                        handleMouseEnter(product.productSeq, product.hoverImage)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      <img
                        className="index-product-image"
                        // ✅ 기존 로컬 서버 경로에서 AWS S3 URL로 변경
                        // src={`http://localhost:8070/product_images/${product.productImage}`}
                        src={getImageUrl(product.productImage)} // ✅ 기존 & 새로운 이미지 지원
                        alt={product.name}
                        onMouseEnter={(e) =>
                          handleImageHover(
                            e, getImageUrl(product.hoverImage)
                            // `http://localhost:8070/product_hover/${product.hoverImage}`
                          )
                        }
                        onMouseLeave={(e) =>
                          handleImageHover(
                            e, getImageUrl(product.productImage)
                            // `http://localhost:8070/product_images/${product.productImage}`
                          )
                        }
                      />
                      {hoveredProductId === product.productSeq && (
                        <div className="quickview">상품 바로가기</div>
                      )}
                    </div>
                  </Link>
                  <div className="name" style={{ marginLeft: "10px" }}>
                    {product.productName}
                  </div>
                  &nbsp;
                  <div
                    className="pro-price"
                    style={{ marginLeft: "10px", fontWeight: "bold" }}
                  >
                    {new Intl.NumberFormat("ko-KR").format(
                      product.productSalePrice
                    )}{" "}
                    원
                  </div>
                  &nbsp;
                </div>
              </div>
            );
          })
        ) : (
          <div>Loading...</div>
        )}
      </div>

      <h1 className="new-title">새롭게 빛나는 신상</h1>


      <div className="itemlist">
        {Array.isArray(newProduct) && newProduct.length > 0 ? (
          newProduct.map((product, idx) => {
            return (
              <div className="item" key={idx}>
                <div className="product-image">
                  <Link to={`/producDetail/${product.productSeq}`}>
                    <div
                      className="image-container"
                      onMouseEnter={() =>
                        handleMouseEnter(product.productSeq, product.hoverImage)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      <img
                        // ✅ 기존 로컬 서버 경로에서 AWS S3 URL로 변경
                        src={getImageUrl(product.productImage)} // ✅ 기존 & 새로운 이미지 지원
                        // src={`http://localhost:8070/product_images/${product.productImage}`}
                        alt={product.name}
                        onMouseEnter={(e) =>
                          handleImageHover(
                            e, getImageUrl(product.hoverImage)
                            // `http://localhost:8070/product_hover/${product.hoverImage}`
                          )
                        }
                        onMouseLeave={(e) =>
                          handleImageHover(
                            e, getImageUrl(product.productImage)
                            // `http://localhost:8070/product_images/${product.productImage}`
                          )
                        }
                      />
                      {hoveredProductId === product.productSeq && (
                        <div className="quickview">상품 바로가기</div>
                      )}
                    </div>
                  </Link>
                  <div className="name" style={{ marginLeft: "10px" }}>
                    {product.productName}
                  </div>
                  &nbsp;
                  <div
                    className="pro-price"
                    style={{ marginLeft: "10px", fontWeight: "bold" }}
                  >
                    {new Intl.NumberFormat("ko-KR").format(
                      product.productSalePrice
                    )}{" "}
                    원
                  </div>
                  &nbsp;
                </div>
              </div>
            );
          })
        ) : (
          <div>Loading...</div>
        )}
      </div>

      <Link
        to="/ring"
        id="all-link"
        style={{ marginTop: "80px", marginBottom: "100px" }}
      >
        Shop All
      </Link>
    </div>
  );
};

export default Index;
