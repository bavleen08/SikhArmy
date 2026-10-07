import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">

      <Link
        to={`/api/products/${product._id}`}
        className="product-card-link"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
        />

        <div className="product-info">
          <h3 className="product-name">
            {product.name}
          </h3>

          <p className="product-price">
            ₹{product.price.toFixed(2)}
          </p>

          <p className="view-button-details">
            View Details
          </p>
        </div>
      </Link>

      <div className="free-delivery-box">
         Free Delivery
      </div>

    </div>
  );
};

export default ProductCard;