const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

// app.use("/auth", authRoutes);
// app.use("/admin", adminRoutes);
// app.use("/owner", ownerRoutes);
// app.use("/user", userRoutes);

const PORT = process.env.PORT || 4001;

app.listen(4000, () => {
  console.log(`server ${PORT}-portda ishga tushdi`);
});
