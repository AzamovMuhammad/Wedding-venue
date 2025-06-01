const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRouter");
const authRoutes = require("./routes/authRoutes");
const profileRouter = require("./routes/profileRouter");
const venueRouter = require("./routes/venueRouter");
const districtRouter = require("./routes/districtsRouter");
const venueImageRoutes = require("./routes/venueImageRoutes");
const bookingRouter = require("./routes/bookingRouter");

app.use(cors());
app.use(express.json());

// login va registratsiya qilish uchun
app.use("/auth", authRoutes);
app.use("/profile", profileRouter);

app.use("/venue", venueRouter);
app.use("/venues", venueImageRoutes);
app.use("/districts", districtRouter);
app.use('/booking', bookingRouter)

app.use("/admin", adminRoutes);
app.use("/users", ownerRoutes);
// app.use("/owner", ownerRoutes);
// app.use("/user", userRoutes);

// Statik fayllarni server qilish (suratlarni ko‘rish uchun)
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`server ${PORT}-portda ishga tushdi`);
});
