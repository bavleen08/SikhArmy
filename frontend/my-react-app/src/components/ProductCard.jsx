import React from "react";
import { Link } from "react-router-dom";
import "../styles/product.css";

const ProductCard = ({product}) =>{
    return(
        <div className="product-card">
            <Link to={`/api/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={product.imageUrl} alt={product.name} className="product-image"></img>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
                <p className="view-button-details"> View Details</p>
                <div  className="free-delivery-box" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                🚚 Free Delivery
                </div>
                
            </div>
            </Link>
        </div>
    );
}


export default ProductCard;