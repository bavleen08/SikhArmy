import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';
import { API_URL } from '../config';

const Register = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();


  // ===============================
  // RESEND COUNTDOWN
  // ===============================

  useEffect(() => {

    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);

  }, [resendCooldown]);


  // ===============================
  // SEND REGISTER OTP
  // ===============================

  const handleSendOTP = async (e) => {

    e.preventDefault();

    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);

    try {

      const res = await fetch(
        `${API_URL}/api/user/register-send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim()
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setError(
          data.message ||
          'Failed to send OTP.'
        );

        return;
      }

      setOtpCode('');
      setStep(2);

      setSuccess(
        'OTP sent successfully. Please check your email, make sure to check your spam or junk folder too.'
      );

      setResendCooldown(30);

    } catch (error) {

      console.error(error);

      setError(
        'Cannot connect to server. Make sure your backend is running.'
      );

    } finally {

      setLoading(false);
    }
  };


  // ===============================
  // VERIFY OTP
  // ===============================

  const handleVerifyAndRegister = async (e) => {

    e.preventDefault();

    setError('');
    setSuccess('');

    if (otpCode.length !== 6) {

      setError(
        'Please enter the 6-digit OTP.'
      );

      return;
    }

    setLoading(true);

    try {

      const res = await fetch(
        `${API_URL}/api/user/register-verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            otp: otpCode
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setError(
          data.message ||
          'Invalid OTP.'
        );

        return;
      }

      login(data);

      navigate('/');

    } catch (error) {

      console.error(error);

      setError(
        'Unable to verify OTP. Please try again.'
      );

    } finally {

      setLoading(false);
    }
  };


  // ===============================
  // RESEND OTP
  // ===============================

  const handleResendOTP = async () => {

    if (resendCooldown > 0) {
      return;
    }

    setError('');
    setSuccess('');
    setResendLoading(true);

    try {

      const res = await fetch(
        `${API_URL}/api/user/register-send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim()
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setError(
          data.message ||
          'Could not resend OTP.'
        );

        return;
      }

      setOtpCode('');

      setSuccess(
        'A new OTP has been sent to your email.'
      );

      setResendCooldown(30);

    } catch (error) {

      console.error(error);

      setError(
        'Failed to resend OTP.'
      );

    } finally {

      setResendLoading(false);
    }
  };


  // ===============================
  // CHANGE EMAIL
  // ===============================

  const handleChangeEmail = () => {

    setOtpCode('');
    setError('');
    setSuccess('');
    setStep(1);
    setResendCooldown(0);
  };


  return (
    <div className="auth-container">

      {step === 1 && (

        <form
          onSubmit={handleSendOTP}
          className="auth-form"
        >

          <h2>Register</h2>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}
            >
              {error}

              {error.includes('already registered') && (
                <>
                  {' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#f97316',
                      fontWeight: 'bold'
                    }}
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn"
          >
            {loading
              ? 'Sending OTP...'
              : 'Send OTP'}
          </button>

          <p>
            Already have an account?{' '}
            <Link to="/login">
              Login
            </Link>
          </p>

        </form>
      )}


      {step === 2 && (

        <form
          onSubmit={handleVerifyAndRegister}
          className="auth-form"
        >

          <h2>Verify Email</h2>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.10)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}
            >
              {success}
            </div>
          )}

          <p
            style={{
              color: '#a1a1aa',
              fontSize: '0.9rem',
              marginBottom: '15px',
              textAlign: 'center'
            }}
          >
            Enter the 6-digit OTP sent to {email}.
          </p>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-Digit OTP"
            maxLength="6"
            value={otpCode}
            onChange={(e) =>
              setOtpCode(
                e.target.value.replace(/\D/g, '')
              )
            }
            required
            style={{
              letterSpacing: '4px',
              textAlign: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              background: '#10b981'
            }}
          >
            {loading
              ? 'Creating Account...'
              : 'Verify & Register'}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={
              resendLoading ||
              resendCooldown > 0
            }
            style={{
              background: 'none',
              border: 'none',
              color:
                resendCooldown > 0
                  ? '#71717a'
                  : '#f97316',
              cursor:
                resendCooldown > 0
                  ? 'not-allowed'
                  : 'pointer',
              marginTop: '15px',
              width: '100%'
            }}
          >
            {resendLoading
              ? 'Sending...'
              : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : 'Resend OTP'}
          </button>
          <p style={{ marginTop: "10px", color: "#a1a1aa", fontSize: "0.85rem", textAlign: "center" }} > Didn't receive the OTP? Check your spam or junk folder. </p>

          <p
            onClick={handleChangeEmail}
            style={{
              color: '#a1a1aa',
              cursor: 'pointer',
              textAlign: 'center',
              marginTop: '15px',
              fontSize: '0.9rem'
            }}
          >
            ← Change Email
          </p>

        </form>
      )}

    </div>
  );
};

export default Register;