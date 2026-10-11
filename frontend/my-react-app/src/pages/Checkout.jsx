import React, {
  useState,
  useContext,
  useEffect
} from 'react';

import {
  useSelector,
  useDispatch
} from 'react-redux';

import {
  useNavigate
} from 'react-router-dom';

import {
  AuthContext
} from '../context/AuthContext';

import {
  clearCart
} from '../redux/cartSlice';
import { API_URL } from '../config';


const Checkout = () => {

  const { user } =
    useContext(AuthContext);

  const cartItems =
    useSelector(
      (state) => state.cart.cartItems
    );

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();


  // ===============================
  // ADDRESS
  // ===============================

  const [address, setAddress] =
    useState({

      fullName: '',

      street: '',

      city: '',

      state: '',

      postalCode: '',

      country: 'India'

    });


  // ===============================
  // PHONE NUMBERS
  // ===============================

  const [primaryPhone, setPrimaryPhone] =
    useState('');

  const [alternatePhone, setAlternatePhone] =
    useState('');


  const [paymentMethod, setPaymentMethod] =
    useState('COD');

  const [loading, setLoading] =
    useState(false);

  const [loadingAddress, setLoadingAddress] =
    useState(true);

  const [error, setError] =
    useState('');


  // ===============================
  // TOTAL
  // ===============================

  const totalPrice =
    cartItems.reduce(
      (acc, item) =>
        acc + item.price * item.qty,
      0
    );


  // ===============================
  // LOAD SAVED ADDRESS
  // ===============================

  useEffect(() => {

    const loadSavedAddress =
      async () => {

        if (!user?.token) {

          setLoadingAddress(false);

          return;
        }

        try {

          const res = await fetch(
            `${API_URL}/api/user/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${user.token}`
              }
            }
          );


          const data =
            await res.json();


          if (
            res.ok &&
            data.user?.defaultAddress
          ) {

            const saved =
              data.user.defaultAddress;


            setAddress({

              fullName:
                saved.fullName || '',

              street:
                saved.street || '',

              city:
                saved.city || '',

              state:
                saved.state || '',

              postalCode:
                saved.postalCode || '',

              country:
                saved.country || 'India'

            });

          }

        } catch (error) {

          console.error(
            'Failed to load saved address:',
            error
          );

        } finally {

          setLoadingAddress(false);
        }
      };


    loadSavedAddress();

  }, [user]);


  // ===============================
  // HANDLE ADDRESS CHANGE
  // ===============================

  const updateAddress = (
    field,
    value
  ) => {

    setAddress(
      previous => ({
        ...previous,
        [field]: value
      })
    );

    setError('');
  };


  // ===============================
  // PHONE CHANGE
  // ===============================

  const handlePhoneChange = (
    setter,
    value
  ) => {

    const numbersOnly =
      value.replace(/\D/g, '');

    setter(
      numbersOnly.slice(0, 10)
    );

    setError('');
  };


  // ===============================
  // SUBMIT ORDER
  // ===============================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');


    // ===============================
    // AUTH
    // ===============================

    if (!user) {

      navigate('/login');

      return;
    }


    // ===============================
    // CART
    // ===============================

    if (cartItems.length === 0) {

      setError(
        'Your shopping cart is empty.'
      );

      return;
    }


    // ===============================
    // PHONE VALIDATION
    // ===============================

    if (
      !/^[6-9]\d{9}$/.test(
        primaryPhone
      )
    ) {

      setError(
        'Please enter a valid 10-digit primary phone number.'
      );

      return;
    }


    if (
      !/^[6-9]\d{9}$/.test(
        alternatePhone
      )
    ) {

      setError(
        'Please enter a valid 10-digit alternate phone number.'
      );

      return;
    }


    // ===============================
    // ADDRESS VALIDATION
    // ===============================

    const requiredFields = [
      ['fullName', 'Full name'],
      ['street', 'Street address'],
      ['city', 'City'],
      ['state', 'State'],
      ['postalCode', 'PIN code'],
      ['country', 'Country']
    ];


    for (
      const [field, label]
      of requiredFields
    ) {

      if (
        !address[field].trim()
      ) {

        setError(
          `Please enter your ${label}.`
        );

        return;
      }
    }


    setLoading(true);


    try {

      const saveOrderRes =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${user.token}`
            },

            body: JSON.stringify({

              items:
                cartItems.map(
                  item => ({
                    name: item.name,

                    qty: item.qty,

                    price: item.price,

                    product:
                      item._id ||
                      item.productId ||
                      item.product
                  })
                ),

              totalAmount:
                totalPrice,

              address,

              paymentMethod,

              primaryPhone,

              alternatePhone

            })
          }
        );


      const data =
        await saveOrderRes.json();


      if (!saveOrderRes.ok) {

        setError(
          data.message ||
          'Failed to place order.'
        );

        return;
      }


      // ===============================
      // SUCCESS
      // ===============================

      dispatch(
        clearCart()
      );


      if (
        paymentMethod === 'WhatsApp'
      ) {

        navigate(
          '/awaiting-payment',
          {
            state: {
              orderId:
                data.orderId,

              total:
                totalPrice
            }
          }
        );

      } else {

        navigate(
          '/ordersuccess',
          {
            state: {
              orderId:
                data.orderId,

              total:
                totalPrice
            }
          }
        );
      }


    } catch (error) {

      console.error(
        'Checkout error:',
        error
      );

      setError(
        'Failed to connect to the backend server.'
      );

    } finally {

      setLoading(false);
    }
  };


  // ===============================
  // STYLES
  // ===============================

  const inputStyle = {

    padding: '12px',

    background: '#09090b',

    border:
      '1px solid #27272a',

    borderRadius: '6px',

    color: '#fff',

    fontSize: '15px',

    outline: 'none',

    width: '100%',

    boxSizing: 'border-box'
  };


  return (

    <div
      className="checkout-container"
      style={{
        maxWidth: '600px',
        margin: '40px auto',
        background: '#18181b',
        padding: '30px',
        borderRadius: '12px',
        border:
          '1px solid #27272a',
        color: '#fff'
      }}
    >

      <h2
        style={{
          color: '#f97316',
          textAlign: 'center',
          marginBottom: '25px'
        }}
      >
        Checkout Control Panel
      </h2>


      {error && (

        <div
          style={{
            background:
              'rgba(239, 68, 68, 0.12)',

            border:
              '1px solid rgba(239, 68, 68, 0.4)',

            color: '#f87171',

            padding: '12px',

            borderRadius: '6px',

            marginBottom: '20px',

            textAlign: 'center'
          }}
        >
          {error}
        </div>

      )}


      {loadingAddress && (

        <p
          style={{
            color: '#a1a1aa',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          Loading your saved address...
        </p>

      )}


      <div
        className="checkout-content"
      >

        <form
          onSubmit={handleSubmit}
          className="shipping-form"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}
        >

          <h3
            style={{
              color: '#e4e4e7',
              borderBottom:
                '1px solid #27272a',
              paddingBottom: '10px'
            }}
          >
            Shipping Address
          </h3>


          <input
            type="text"
            placeholder="Recipient Full Name"
            value={address.fullName}
            onChange={(e) =>
              updateAddress(
                'fullName',
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          <input
            type="text"
            placeholder="Street Address / Area Line"
            value={address.street}
            onChange={(e) =>
              updateAddress(
                'street',
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          <input
            type="text"
            placeholder="City"
            value={address.city}
            onChange={(e) =>
              updateAddress(
                'city',
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          <input
            type="text"
            placeholder="State"
            value={address.state}
            onChange={(e) =>
              updateAddress(
                'state',
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          <input
            type="text"
            placeholder="Postal PIN Code"
            value={address.postalCode}
            onChange={(e) =>
              updateAddress(
                'postalCode',
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          <input
            type="text"
            placeholder="Country"
            value={address.country}
            onChange={(e) =>
              updateAddress(
                'country',
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          {/* =========================
              PHONE NUMBERS
          ========================== */}

          <h3
            style={{
              color: '#e4e4e7',
              borderBottom:
                '1px solid #27272a',
              paddingBottom: '10px',
              marginTop: '15px'
            }}
          >
            Contact Numbers
          </h3>


          <input
            type="tel"
            inputMode="numeric"
            placeholder="Primary / Personal Phone Number"
            value={primaryPhone}
            maxLength="10"
            onChange={(e) =>
              handlePhoneChange(
                setPrimaryPhone,
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          <input
            type="tel"
            inputMode="numeric"
            placeholder="Alternate / Residence Phone Number"
            value={alternatePhone}
            maxLength="10"
            onChange={(e) =>
              handlePhoneChange(
                setAlternatePhone,
                e.target.value
              )
            }
            required
            style={inputStyle}
          />


          <p
            style={{
              color: '#71717a',
              fontSize: '0.85rem',
              marginTop: '-5px'
            }}
          >
            We will use the alternate number
            if your primary number is unreachable.
            These numbers are not OTP verified.
          </p>


          {/* =========================
              PAYMENT
          ========================== */}

          <h4
            style={{
              color: '#f97316',
              marginTop: '15px',
              marginBottom: '5px'
            }}
          >
            Choose Settlement Method:
          </h4>


          <div
            style={{
              display: 'flex',
              gap: '20px',
              background: '#09090b',
              padding: '15px',
              borderRadius: '8px',
              border:
                '1px solid #27272a',
              flexWrap: 'wrap'
            }}
          >

            <label
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem'
              }}
            >

              <input
                type="radio"
                name="payment"
                value="COD"
                checked={
                  paymentMethod === 'COD'
                }
                onChange={() =>
                  setPaymentMethod('COD')
                }
                style={{
                  accentColor: '#f97316',
                  transform: 'scale(1.1)'
                }}
              />

              💵 Cash on Delivery (COD)

            </label>


            <label
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem'
              }}
            >

              <input
                type="radio"
                name="payment"
                value="WhatsApp"
                checked={
                  paymentMethod === 'WhatsApp'
                }
                onChange={() =>
                  setPaymentMethod(
                    'WhatsApp'
                  )
                }
                style={{
                  accentColor: '#10b981',
                  transform: 'scale(1.1)'
                }}
              />

              💬 Pay via WhatsApp UPI / QR

            </label>

          </div>


          {/* =========================
              TOTAL
          ========================== */}

          <div
            className="checkout-summary"
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop:
                '1px solid #27272a',
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap'
            }}
          >

            <h4
              style={{
                fontSize: '1.3rem',
                margin: '0'
              }}
            >
              Total Amount:

              <span
                style={{
                  color: '#10b981'
                }}
              >
                ₹{totalPrice.toFixed(2)}
              </span>

            </h4>


            <button
              type="submit"
              disabled={
                loading ||
                cartItems.length === 0
              }
              className="btn"
              style={{
                background:
                  paymentMethod === 'COD'
                    ? '#f97316'
                    : '#10b981',

                color: '#fff',

                border: 'none',

                padding:
                  '14px 28px',

                borderRadius: '6px',

                fontWeight: 'bold',

                fontSize: '1.05rem',

                cursor: 'pointer'
              }}
            >

              {loading
                ? 'Logging order...'
                : paymentMethod === 'COD'
                  ? '📦 Book Order via COD'
                  : '💬 Pay Now via WhatsApp'}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


export default Checkout;