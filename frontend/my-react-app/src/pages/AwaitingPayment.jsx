
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AwaitingPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    orderId = 'Pending',
    total = 0,
    orderItems = [],
  } = location.state || {};

  const handleRetryWhatsApp = () => {
    const ownerPersonalNumber = '917717323249';

    const productNames = orderItems.length
      ? orderItems
          .map((item) => item.name || item.product?.name || 'Product')
          .join(', ')
      : 'Product details unavailable';

    const backupMessage = encodeURIComponent(
      `🙏 *Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!*\n\n` +
      `Ji, I am finalizing payment for my Order #${orderId} for ₹${Number(total).toFixed(2)}.\n\n` +
      `🛍️ *Products:* ${productNames}\n\n` +
      `Please drop your UPI QR code here! 🙌`
    );

    window.open(
      `https://wa.me/${ownerPersonalNumber}?text=${backupMessage}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div
      style={{
        maxWidth: '550px',
        margin: '80px auto',
        background: '#18181b',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid #27272a',
        textAlign: 'center',
        color: '#fff',
      }}
    >
      <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>
        ⏳
      </div>

      <h2 style={{ color: '#f97316', marginBottom: '10px' }}>
        Order Logged - Awaiting WhatsApp Payment
      </h2>

      <p
        style={{
          color: '#a1a1aa',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          marginBottom: '25px',
        }}
      >
        Thank you! Your items are securely reserved. To finalize your
        purchase and approve shipping dispatch, you must verify your
        online transfer.
      </p>

      <div
        style={{
          background: '#09090b',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px',
          textAlign: 'left',
          border: '1px solid #27272a',
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Order Number:</strong>{' '}
          <span style={{ color: '#f97316', fontFamily: 'monospace' }}>
            #{orderId}
          </span>
        </p>

        <p style={{ margin: 0 }}>
          <strong>Total Bill Due:</strong>{' '}
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>
            ₹{Number(total).toFixed(2)}
          </span>
        </p>

        {orderItems.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <strong>Products:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
              {orderItems.map((item, index) => (
                <li key={item._id || item.product?._id || index}>
                  {item.name || item.product?.name || 'Product'}
                  {item.quantity ? ` × ${item.quantity}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handleRetryWhatsApp}
          style={{
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '1.05rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          }}
        >
          💬 Click to Send WhatsApp Payment Screenshot
        </button>

        <button
          onClick={() => navigate('/shop')}
          style={{
            background: 'none',
            border: '1px solid #27272a',
            color: '#a1a1aa',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: '0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a1a1aa';
          }}
        >
          Return back to Storefront
        </button>
      </div>

      <p style={{ color: '#71717a', fontSize: '0.8rem', marginTop: '25px' }}>
        ⚠️ <i>
          If no payment confirmation screenshot is received within 24 hours,
          this reservation expires automatically.
        </i>
      </p>
    </div>
  );
};

export default AwaitingPayment;
