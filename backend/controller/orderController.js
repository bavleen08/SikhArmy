const Order = require('../model/Order');
const User = require('../model/User');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const formatCurrency = (amount) => {

  return new Intl.NumberFormat(
    'en-IN',
    {
      style: 'currency',
      currency: 'INR'
    }
  ).format(amount);
};


const escapeHtml = (value = '') => {

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};


const getItemsMarkup = (items) => {

  return items
    .map(item => `
      <tr>
        <td style="
          padding:10px;
          border-bottom:1px solid #27272a;
        ">
          ${escapeHtml(item.name)}
        </td>

        <td style="
          padding:10px;
          text-align:center;
          border-bottom:1px solid #27272a;
        ">
          ${item.qty}
        </td>

        <td style="
          padding:10px;
          text-align:right;
          border-bottom:1px solid #27272a;
        ">
          ${formatCurrency(
            item.price * item.qty
          )}
        </td>
      </tr>
    `)
    .join('');
};


const getAddressMarkup = (address) => {

  return `
    ${escapeHtml(address.fullName)}<br/>

    ${escapeHtml(address.street)}<br/>

    ${escapeHtml(address.city)},
    ${escapeHtml(address.state)}<br/>

    PIN:
    ${escapeHtml(address.postalCode)}<br/>

    ${escapeHtml(address.country)}
  `;
};

const addOrderItems = async (req, res) => {

  try {

    const {
      items,
      totalAmount,
      address,
      paymentMethod,
      primaryPhone,
      alternatePhone
    } = req.body;


    
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {

      return res.status(400).json({
        message: 'Your cart is empty.'
      });
    }


    if (
      !primaryPhone ||
      !/^[6-9]\d{9}$/.test(primaryPhone)
    ) {

      return res.status(400).json({
        message:
          'Please enter a valid 10-digit primary phone number.'
      });
    }


    if (
      !alternatePhone ||
      !/^[6-9]\d{9}$/.test(alternatePhone)
    ) {

      return res.status(400).json({
        message:
          'Please enter a valid 10-digit alternate phone number.'
      });
    }


    if (
      !address ||
      !address.fullName ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.postalCode ||
      !address.country
    ) {

      return res.status(400).json({
        message:
          'Please provide your complete shipping address.'
      });
    }


    const safeTotalAmount =
      Number(totalAmount);


    if (
      !Number.isFinite(safeTotalAmount) ||
      safeTotalAmount < 0
    ) {

      return res.status(400).json({
        message: 'Invalid order total.'
      });
    }

    // CREATE ORDER
    
    const order = new Order({

      user: req.user._id,

      primaryPhone,

      alternatePhone,

      items,

      totalAmount: safeTotalAmount,

      address: {
        fullName:
          address.fullName.trim(),

        street:
          address.street.trim(),

        city:
          address.city.trim(),

        state:
          address.state.trim(),

        postalCode:
          address.postalCode.trim(),

        country:
          address.country.trim()
      },

      paymentMethod,

      isPaid: false
    });


    const createdOrder =
      await order.save();

    // SAVE ADDRESS TO USER

    try {

      await User.findByIdAndUpdate(
        req.user._id,

        {
          $set: {
            defaultAddress: {
              fullName:
                address.fullName.trim(),

              street:
                address.street.trim(),

              city:
                address.city.trim(),

              state:
                address.state.trim(),

              postalCode:
                address.postalCode.trim(),

              country:
                address.country.trim()
            }
          }
        }
      );

      console.log(
        'User default address saved successfully.'
      );

    } catch (addressError) {

      // Do NOT fail the order if address
      // saving fails.

      console.error(
        'Could not save default address:',
        addressError
      );
    }

    // CUSTOMER + OWNER EMAILS

    try {

      const itemsMarkup =
        getItemsMarkup(items);

      const addressMarkup =
        getAddressMarkup(
          createdOrder.address
        );


      // OWNER EMAIL

      const ownerEmail = transporter.sendMail({

        from:
          `"Sikh Army Store" <${process.env.SMTP_EMAIL}>`,

        to:
          process.env.OWNER_ALERT_EMAIL,

        subject:
          `🚨 NEW ORDER - #${createdOrder._id.toString().slice(-6)}`,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:700px;
            margin:auto;
            background:#18181b;
            color:#fff;
            padding:30px;
            border-radius:12px;
          ">

            <h2 style="
              color:#f97316;
              border-bottom:2px solid #f97316;
              padding-bottom:10px;
            ">
              Sikh Army Store - New Order
            </h2>


            <p>
              <strong>Order ID:</strong>
              #${createdOrder._id}
            </p>


            <p>
              <strong>Customer:</strong>
              ${escapeHtml(
                address.fullName
              )}
            </p>


            <p>
              <strong>Customer Email:</strong>
              ${escapeHtml(
                req.user.email
              )}
            </p>


            <p>
              <strong>Primary Phone:</strong>
              ${escapeHtml(
                primaryPhone
              )}
            </p>


            <p>
              <strong>Alternate Phone:</strong>
              ${escapeHtml(
                alternatePhone
              )}
            </p>


            <p>
              <strong>Payment Method:</strong>
              ${
                paymentMethod === 'COD'
                  ? '💵 Cash on Delivery'
                  : '💬 WhatsApp UPI / QR'
              }
            </p>


            <h3 style="
              color:#e4e4e7;
              margin-top:25px;
            ">
              🛒 Products
            </h3>


            <table style="
              width:100%;
              border-collapse:collapse;
            ">

              <thead>
                <tr>
                  <th style="
                    text-align:left;
                    padding:10px;
                  ">
                    Product
                  </th>

                  <th style="
                    padding:10px;
                  ">
                    Qty
                  </th>

                  <th style="
                    text-align:right;
                    padding:10px;
                  ">
                    Price
                  </th>
                </tr>
              </thead>

              <tbody>
                ${itemsMarkup}
              </tbody>

            </table>


            <h3 style="
              color:#10b981;
              margin-top:25px;
            ">
              Total:
              ${formatCurrency(
                safeTotalAmount
              )}
            </h3>


            <h3 style="
              color:#e4e4e7;
              margin-top:25px;
            ">
              🚚 Shipping Address
            </h3>


            <div style="
              background:#09090b;
              border:1px solid #27272a;
              padding:15px;
              border-radius:8px;
              line-height:1.7;
            ">
              ${addressMarkup}
            </div>

          </div>
        `
      });


      // CUSTOMER EMAIL

      const customerEmail =
        transporter.sendMail({

          from:
            `"Sikh Army Store" <${process.env.SMTP_EMAIL}>`,

          to:
            req.user.email,

          subject:
            ` Order Received - Sikh Army Store #${createdOrder._id.toString().slice(-6)}`,

          html: `
            <div style="
              font-family:Arial,sans-serif;
              max-width:700px;
              margin:auto;
              background:#18181b;
              color:#fff;
              padding:30px;
              border-radius:12px;
            ">

              <h2 style="
                color:#f97316;
              ">
                 Thank You for Your Order!
              </h2>


              <p style="
                color:#d4d4d8;
                font-size:16px;
              ">
                Waheguru Ji Ka Khalsa,
                Waheguru Ji Ki Fateh!
              </p>


              <p style="
                color:#d4d4d8;
              ">
                Your order has been successfully
                received by Sikh Army Store.
              </p>


              <div style="
                background:#09090b;
                border:1px solid #27272a;
                padding:20px;
                border-radius:10px;
                margin:20px 0;
              ">

                <p>
                  <strong>Order ID:</strong>
                  #${createdOrder._id}
                </p>

                <p>
                  <strong>Order Status:</strong>
                  Pending
                </p>

                <p>
                  <strong>Payment:</strong>
                  ${
                    paymentMethod === 'COD'
                      ? '💵 Cash on Delivery'
                      : '💬 WhatsApp UPI / QR'
                  }
                </p>

                <p style="
                  color:#10b981;
                  font-size:20px;
                  font-weight:bold;
                ">
                  Total:
                  ${formatCurrency(
                    safeTotalAmount
                  )}
                </p>

              </div>


              <h3>
                🛒 Your Products
              </h3>


              <table style="
                width:100%;
                border-collapse:collapse;
              ">

                <tbody>
                  ${itemsMarkup}
                </tbody>

              </table>


              <h3 style="
                margin-top:25px;
              ">
                🚚 Delivery Address
              </h3>


              <div style="
                background:#09090b;
                border:1px solid #27272a;
                padding:15px;
                border-radius:8px;
                line-height:1.7;
              ">
                ${addressMarkup}
              </div>


              <h3 style="
                margin-top:25px;
              ">
                📞 Contact Numbers
              </h3>


              <p>
                Primary:
                ${escapeHtml(primaryPhone)}
              </p>

              <p>
                Alternate:
                ${escapeHtml(alternatePhone)}
              </p>


              <p style="
                color:#a1a1aa;
                margin-top:30px;
              ">
                We will use your alternate number
                if the primary number is unreachable.
              </p>


              <p style="
                color:#71717a;
                text-align:center;
                margin-top:30px;
              ">
                Sikh Army Store
              </p>

            </div>
          `
        });


      await Promise.allSettled([
        ownerEmail,
        customerEmail
      ]);


      console.log(
        'Order notification emails processed.'
      );

    } catch (mailError) {

      console.error(
        'Order email error:',
        mailError
      );

      // Email failure must NOT cancel
      // an already-created order.
    }

    // RESPONSE

    res.status(201).json({

      success: true,

      message:
        'Order placed successfully.',

      orderId:
        createdOrder._id,

      savedAddress:
        createdOrder.address

    });

  } catch (error) {

    console.error(
      'Add Order Error:',
      error
    );

    res.status(500).json({
      message:
        error.message ||
        'Failed to place order.'
    });
  }
};

// GET MY ORDERS

const getMyOrder = async (req, res) => {

  try {

    const orders = await Order
      .find({
        user: req.user._id
      })
      .sort({
        createdAt: -1
      });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

// GET ALL ORDERS

const getOrders = async (req, res) => {

  try {

    const orders = await Order
      .find({})
      .populate(
        'user',
        'name email'
      )
      .sort({
        createdAt: -1
      });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

// UPDATE ORDER STATUS

const updateOrderStatus = async (req, res) => {

  try {

    const order =
      await Order
        .findById(req.params.id)
        .populate(
          'user',
          'name email'
        );

    if (!order) {

      return res.status(404).json({
        message: 'Order not found'
      });
    }


    const oldStatus =
      order.status;

    const newStatus =
      req.body.status ||
      order.status;

    const oldPaid =
      order.isPaid;


    order.status =
      newStatus;


    if (
      req.body.isPaid !== undefined
    ) {

      order.isPaid =
        req.body.isPaid;

      if (
        req.body.isPaid &&
        !oldPaid
      ) {
        order.paidAt =
          new Date();
      }
    }


    const updatedOrder =
      await order.save();


    // CUSTOMER STATUS EMAIL

    if (
      order.user?.email &&
      oldStatus !== newStatus
    ) {

      let heading =
        'Your order status has been updated.';

      if (
        newStatus === 'Processing'
      ) {
        heading =
          'Your order has been confirmed and is now being processed.';
      }

      if (
        newStatus === 'Shipped'
      ) {
        heading =
          'Your order has been shipped.';
      }

      if (
        newStatus === 'Delivered'
      ) {
        heading =
          'Your order has been delivered.';
      }


      try {

        await transporter.sendMail({

          from:
            `"Sikh Army Store" <${process.env.SMTP_EMAIL}>`,

          to:
            order.user.email,

          subject:
            `📦 Order Update - #${order._id.toString().slice(-6)}`,

          html: `
            <div style="
              font-family:Arial,sans-serif;
              max-width:600px;
              margin:auto;
              background:#18181b;
              color:#fff;
              padding:30px;
              border-radius:12px;
            ">

              <h2 style="
                color:#f97316;
              ">
                 Sikh Army Store
              </h2>


              <h3>
                ${heading}
              </h3>


              <div style="
                background:#09090b;
                padding:20px;
                border-radius:10px;
                border:1px solid #27272a;
                margin-top:20px;
              ">

                <p>
                  <strong>Order ID:</strong>
                  #${order._id}
                </p>

                <p>
                  <strong>Status:</strong>
                  ${order.status}
                </p>

                <p style="
                  color:#10b981;
                  font-size:18px;
                  font-weight:bold;
                ">
                  Total:
                  ${formatCurrency(
                    order.totalAmount
                  )}
                </p>

              </div>


              <p style="
                color:#a1a1aa;
                margin-top:25px;
              ">
                Thank you for shopping with
                Sikh Army Store.
              </p>

            </div>
          `
        });

      } catch (mailError) {

        console.error(
          'Customer status email error:',
          mailError
        );
      }
    }


    res.json(updatedOrder);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  addOrderItems,
  getOrders,
  getMyOrder,
  updateOrderStatus
};