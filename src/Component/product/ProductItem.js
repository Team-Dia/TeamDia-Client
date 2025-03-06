import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultPlaceholder from "../image/default-placeholder.jpg";
import "./ProductItem.css";

const ProductItem = ({ product }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/productDetail/${product.productSeq}`);
    };

    return (
        <div className="product-item" onClick={handleClick}>
            <img
                src={product.productImage ? `http://localhost:8070/product_images/${product.productImage}` : defaultPlaceholder}
                alt={product.productName}
                className="product-item-image"
            />
            <div className="product-info">
                <h4 className="product-name">{product.productName}</h4>
                <p className="product-price">{product.productSalePrice.toLocaleString()}원</p>
            </div>
        </div>
    );
};

export default ProductItem;
