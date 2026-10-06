import React from "react";
import {
  Link,
  useLocation
} from "react-router-dom";


const OrderSuccess = () => {

  const location =
    useLocation();


  const orderId =
    location.state?.orderId;


  const total =
    location.state?.total;


  const shortOrderId =
    orderId
      ? String(orderId)
          .slice(-6)
          .toUpperCase()
      : null;


  return (

    <div
      className="container py-5"
    >

      <div
        className="mx-auto text-center p-5"
        style={{
          maxWidth: "600px",

          background: "#18181b",

          borderRadius: "16px",

          border:
            "1px solid #27272a",

          color: "#fff"
        }}
      >

        <div
          style={{
            fontSize: "60px",
            marginBottom: "15px"
          }}
        >
          ✅
        </div>


        <h2
          style={{
            color: "#10b981"
          }}
        >
          Order Placed Successfully!
        </h2>


        {shortOrderId && (

          <p
            className="mt-3"
            style={{
              color: "#f97316",
              fontSize: "1.2rem",
              fontWeight: "bold"
            }}
          >
            Order #{shortOrderId}
          </p>

        )}


        {total !== undefined && (

          <p
            style={{
              color: "#10b981",
              fontSize: "1.3rem",
              fontWeight: "bold"
            }}
          >
            Total: ₹{Number(total).toFixed(2)}
          </p>

        )}


        <p
          style={{
            color: "#a1a1aa",
            fontSize: "1.05rem",
            marginTop: "20px"
          }}
        >

          Thank you for shopping with
          Sikh Army Store.

          <br />

          A confirmation email has been
          sent to your registered email address.

        </p>


        <Link
          to="/shop"
          className="btn mt-3"
          style={{
            background: "#f97316",
            color: "#fff"
          }}
        >
          Continue Shopping
        </Link>

      </div>

    </div>
  );
};


export default OrderSuccess;