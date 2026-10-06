// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");
// connectDB();


// const app = express();
// app.use(cors(
//     {
//         origin: ["http://localhost:3000", "http://localhost:5173"],
//         credentials: true,
//     }
// ));
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));


// app.get("/", (req, res) =>{
//     res.send("backend is working properly");
// });


// app.use("/api/user", require('./routes/userRoutes'));
// app.use("/api/products", require('./routes/productRoutes'));
// app.use("/api/orders", require('./routes/orderRoutes'));
// // app.use("/api/payment", require('./routes/paymentRoutes'));
// app.use("/api/admin", require('./routes/adminRoutes'));


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>{
//     console.log(`server is running on port ${PORT}`);
// }); 

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://sikh-army.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("backend is working properly");
});

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
// app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

module.exports = app;