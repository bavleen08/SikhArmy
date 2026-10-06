import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart, buyNow } from '../redux/cartSlice';
import '../styles/product.css';
import { API_URL } from '../config';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  const dispatch = useDispatch();

  // ===============================
  // SHOW MESSAGE
  // ===============================

  const showMessage = (text, type = 'error') => {
    setMessage({
      type,
      text
    });

    setTimeout(() => {
      setMessage({
        type: '',
        text: ''
      });
    }, 4000);
  };


  // ===============================
  // FETCH PRODUCT
  // ===============================

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        setLoading(true);

        const res = await fetch(
          `${API_URL}/api/products/${id}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || 'Unable to load product.'
          );
        }

        setProduct(data);

      } catch (error) {

        console.error('Fetch product error:', error);

        showMessage(
          error.message || 'Unable to load product.'
        );

      } finally {

        setLoading(false);

      }
    };

    fetchProduct();

  }, [id]);


  // ===============================
  // ADD TO CART
  // ===============================

  const handleAddToCart = () => {

    try {

      if (!product) {
        showMessage(
          'This product is currently unavailable.'
        );
        return;
      }

      if (!product._id) {
        showMessage(
          'Unable to add this product to cart.'
        );
        return;
      }

      dispatch(
        addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          qty: 1
        })
      );

      showMessage(
        `${product.name} added to your cart.`,
        'success'
      );

    } catch (error) {

      console.error('Add to cart error:', error);

      showMessage(
        'Something went wrong while adding the product to your cart.'
      );

    }
  };

  const handleBuyNow = () => {

  try {

    if (!product) {
      showMessage(
        'This product is currently unavailable.'
      );
      return;
    }

    if (!product._id) {
      showMessage(
        'Unable to purchase this product.'
      );
      return;
    }

    dispatch(
      buyNow({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: 1
      })
    );

    navigate('/checkout');

  } catch (error) {

    console.error('Buy now error:', error);

    showMessage(
      'Something went wrong. Please try again.'
    );
  }
};

const today = new Date();
const deliverByDate = new Date();
// Set it to exactly 4 days from today
deliverByDate.setDate(today.getDate() + 4);

// Format the date beautifully (e.g., "06 Oct")
const options = { day: '2-digit', month: 'short' };
const formattedDeliveryDate = deliverByDate.toLocaleDateString('en-IN', options);

  // ===============================
  // LOADING
  // ===============================

  if (loading) {

    return (
      <div
        style={{
          textAlign: 'center',
          margin: '100px',
          color: '#f97316'
        }}
      >
        Loading Product...
      </div>
    );

  }


  // ===============================
  // PRODUCT NOT FOUND
  // ===============================

  if (!product) {

    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '100px auto',
          padding: '25px',
          textAlign: 'center',
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          color: '#ef4444'
        }}
      >
        Product Not Found
      </div>
    );

  }


  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '20px',
        color: '#fff'
      }}
    >

      {/* ===============================
          MESSAGE
      =============================== */}

      {message.text && (

        <div
          style={{
            marginBottom: '25px',
            padding: '14px 18px',
            borderRadius: '10px',
            background:
              message.type === 'success'
                ? 'rgba(16,185,129,0.1)'
                : 'rgba(239,68,68,0.1)',
            border:
              message.type === 'success'
                ? '1px solid rgba(16,185,129,0.3)'
                : '1px solid rgba(239,68,68,0.3)',
            color:
              message.type === 'success'
                ? '#10b981'
                : '#f87171',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          {message.text}
        </div>

      )}


      {/* ===============================
          PRODUCT
      =============================== */}

       <div style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '0.95rem' }}>
         <Link to="/" style={{ color: '#f97316' }}>Home</Link> / <Link to="/shop" style={{ color: '#f97316' }}>Shop</Link>/ <span style={{ color: '#fff' }}>{product.name}</span>
       </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '30px'
        }}
      >

        {/* IMAGE */}

        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              maxHeight: '500px',
              objectFit: 'contain',
              borderRadius: '10px'
            }}
          />
        </div>


        {/* DETAILS */}

        <div>

          <h1
            style={{
              color: '#fff',
              marginBottom: '15px'
            }}
          >
            {product.name}
          </h1>


          <p
            style={{
              color: '#f97316',
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '15px'
            }}
          >
            ₹{Number(product.price).toFixed(2)}
          </p>


          {product.description && (

            <p
              style={{
                color: '#a1a1aa',
                lineHeight: '1.7',
                marginBottom: '25px'
              }}
            >
              {product.description}
            </p>

          )}


          <div
  style={{
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '25px'
  }}
>
  <div style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px dashed #f97316', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
   <span style={{ fontSize: '1.4rem' }}>🚚</span>
  <div>
    <p style={{ margin: '0', color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>Special Launch Offer: 100% Free Delivery</p>
    <p style={{ margin: '0', color: '#a1a1aa', fontSize: '0.8rem' }}>No minimum order value required. Cash on Delivery is available.</p>
  </div>
</div>
         <p style={{ color: '#10b981', fontSize: '0.9rem', margin: '5px 0', fontWeight: '500' }}>
        🚚 Delivery by <strong>{formattedDeliveryDate}</strong> (Within 2-3 Days)
        </p>

  <button
    type="button"
    onClick={handleAddToCart}
    className="btn"
  >
    Add to Cart
  </button>

  <button
    type="button"
    onClick={handleBuyNow}
    className="btn"
    style={{
      background: 'transparent',
      border: '1px solid #f97316',
      color: '#f97316',
      boxShadow: 'none'
    }}
  >
    Buy Now
  </button>
  <p style={{ marginTop: '20px', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {product.stock > 0 ? `● In Stock` : `● Temporarily Out of Stock`}
        </p>
</div>


          <div style={{ marginTop: '20px' }}>
            <Link
              to="/shop"
              style={{
                color: '#a1a1aa',
                fontSize: '0.9rem'
              }}
            >
              ← Continue Shopping
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;