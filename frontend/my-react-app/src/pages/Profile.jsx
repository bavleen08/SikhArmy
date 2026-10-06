import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(
          `${API_URL}/api/orders/myorders`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );

        const data = await res.json();

        if (res.ok) {
          setOrders(Array.isArray(data) ? data : []);
        } else {
          if (res.status === 401) {
            logout();
            navigate('/login');
            return;
          }

          setError(data.message || 'Unable to load your orders.');
          setOrders([]);
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
        setError('Unable to connect to the server.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const containerStyle = {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '30px',
    background: '#18181b',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#fafafa'
  };

  const badgeStyle = {
    background: 'rgba(249,115,22,0.1)',
    color: '#f97316',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    display: 'inline-block'
  };

  return (
    <div style={containerStyle}>

      {/* PROFILE HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '30px',
          marginBottom: '30px',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h2
            style={{
              color: '#fff',
              fontSize: '2.2rem',
              marginBottom: '10px'
            }}
          >
            My Profile
          </h2>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1.2rem',
              marginBottom: '5px'
            }}
          >
            <strong style={{ color: '#fff' }}>Name:</strong>{' '}
            {user.name || 'User'}
          </p>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1.2rem',
              marginBottom: '15px'
            }}
          >
            <strong style={{ color: '#fff' }}>Email:</strong>{' '}
            {user.email || 'Not available'}
          </p>

          <span style={badgeStyle}>
            Account Type:{' '}
            {(user.role || 'user').toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="btn"
          style={{
            background: '#ef4444',
            boxShadow: 'none'
          }}
        >
          Logout
        </button>
      </div>


      {/* ORDER HISTORY */}
      <h3
        style={{
          color: '#f97316',
          marginBottom: '20px',
          fontSize: '1.5rem'
        }}
      >
        Order History
      </h3>


      {/* LOADING */}
      {loading && (
        <p style={{ color: '#a1a1aa' }}>
          Fetching your orders...
        </p>
      )}


      {/* ERROR */}
      {!loading && error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}


      {/* NO ORDERS */}
      {!loading && !error && orders.length === 0 && (
        <div
          style={{
            background: '#09090b',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #27272a'
          }}
        >
          <p
            style={{
              color: '#a1a1aa',
              marginBottom: '15px'
            }}
          >
            You haven't placed any orders yet.
          </p>

          <Link to="/shop" className="btn">
            Start Shopping
          </Link>
        </div>
      )}


      {/* ORDERS */}
      {!loading && orders.length > 0 && (
        <div
          style={{
            display: 'grid',
            gap: '20px'
          }}
        >

          {orders.map((order) => {

            const totalAmount = Number(order.totalAmount || 0);

            const statusBackground =
              order.status === 'Delivered'
                ? 'rgba(16,185,129,0.1)'
                : order.status === 'Shipped'
                ? 'rgba(59,130,246,0.1)'
                : order.status === 'Processing'
                ? 'rgba(249,115,22,0.1)'
                : 'rgba(245,158,11,0.1)';

            const statusColor =
              order.status === 'Delivered'
                ? '#10b981'
                : order.status === 'Shipped'
                ? '#3b82f6'
                : order.status === 'Processing'
                ? '#f97316'
                : '#f59e0b';

            return (
              <div
  key={order._id}
  onClick={() => {
    const productId =
      order.items?.[0]?.product?._id ||
      order.items?.[0]?.product;

    if (productId) {
      navigate(`/api/products/${productId}`);
    }
  }}
  style={{
    background: '#09090b',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #27272a',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#f97316';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#27272a';
  }}
>

                {/* ORDER INFORMATION */}
                <div style={{ flex: 1, minWidth: '250px' }}>

                  {/* ORDER ID */}
                  <p
                    style={{
                      color: '#a1a1aa',
                      fontSize: '0.9rem',
                      marginBottom: '5px'
                    }}
                  >
                    Order ID:{' '}
                    <span style={{ color: '#fff' }}>
                      {order._id}
                    </span>
                  </p>


                  {/* DATE */}
                  <p
                    style={{
                      color: '#a1a1aa',
                      fontSize: '0.9rem',
                      marginBottom: '12px'
                    }}
                  >
                    Placed On:{' '}
                    <span style={{ color: '#fff' }}>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </p>


                  {/* PRODUCTS */}
                  <div>

                    <p
                      style={{
                        color: '#a1a1aa',
                        fontSize: '0.9rem',
                        marginBottom: '8px'
                      }}
                    >
                      You Purchased:
                    </p>


                    {order.items && order.items.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '7px'
                        }}
                      >

                        {order.items.map((item, index) => {

                          const productId =
                            item.product?._id ||
                            item.product;

                          return (
                            <div
                              key={item._id || index}
                              onClick={() => {
                                if (productId) {
                                  navigate(
                                    `/product/${productId}`
                                  );
                                }
                              }}
                              style={{
                                color: productId
                                  ? '#f97316'
                                  : '#fff',
                                cursor: productId
                                  ? 'pointer'
                                  : 'default',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                width: 'fit-content'
                              }}
                              onMouseEnter={(e) => {
                                if (productId) {
                                  e.currentTarget.style.textDecoration =
                                    'underline';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration =
                                  'none';
                              }}
                            >
                              {item.name}

                              {item.qty > 1 && (
                                <span
                                  style={{
                                    color: '#71717a',
                                    marginLeft: '8px',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  × {item.qty}
                                </span>
                              )}
                            </div>
                          );
                        })}

                      </div>
                    ) : (
                      <span
                        style={{
                          color: '#fff'
                        }}
                      >
                        N/A
                      </span>
                    )}

                  </div>


                  {/* TOTAL */}
                  <p
                    style={{
                      color: '#a1a1aa',
                      fontSize: '0.9rem',
                      marginTop: '15px'
                    }}
                  >
                    Total:{' '}
                    <strong
                      style={{
                        color: '#f97316'
                      }}
                    >
                      ₹{totalAmount.toFixed(2)}
                    </strong>
                  </p>

                </div>


                {/* ORDER STATUS */}
                <div>
                  <span
                    style={{
                      background: statusBackground,
                      color: statusColor,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}
                  >
                    {order.status || 'Pending'}
                  </span>
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default Profile;

