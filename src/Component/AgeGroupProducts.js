import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AgeGroupProducts.css";

const AgeGroupProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/products/popular-by-age");
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError("연령대별 인기 제품을 불러오는데 실패했습니다.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="age-group-products">
      <h2>연령대별 인기 제품</h2>
      <div className="products-container">
        {products.map((product) => (
          <div key={product.productSeq} className="product-card">
            <div className="age-group-tag">{product.ageGroup} 인기상품</div>
            <img
              src={product.productImage}
              alt={product.productName}
              className="product-image"
            />
            <h3>{product.productName}</h3>
            <p className="price">
              {product.productSalePrice.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgeGroupProducts;
