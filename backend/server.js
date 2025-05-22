const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();


const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const { authentication } = require("./middleware/authentication");
const { checkRole } = require("./middleware/checkRole");

app.use(cors());
app.use(express.json());

// login va registratsiya qilish uchun 
app.use("/auth", authRoutes);


app.use("/admin", adminRoutes);
// app.use("/owner", ownerRoutes);
// app.use("/user", userRoutes);

// for test
app.use("/fAdmin", authentication, checkRole("admin"), (req, res)  => {
  res.send("Faqat admin uchun")
})

app.use("/admin_owner", authentication, checkRole("admin", "owner"), (req, res) => {
  res.send("Faqat admin va owner uchun")
})


const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`server ${PORT}-portda ishga tushdi`);
});
