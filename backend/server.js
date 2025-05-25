const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();


const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRouter = require("./routes/profileRouter")
const venueRouter = require("./routes/venueRouter")
const districtRouter = require("./routes/districtsRouter");


app.use(cors());
app.use(express.json());

// login va registratsiya qilish uchun 
app.use("/auth", authRoutes);
app.use("/profile",  profileRouter)

app.use('/venue', venueRouter)
app.use("/districts", districtRouter);


app.use("/admin", adminRoutes);
// app.use("/owner", ownerRoutes);
// app.use("/user", userRoutes);



const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`server ${PORT}-portda ishga tushdi`);
});
