require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");
const userRouter = require("./routes/users");
const User = require("./models/user");
const app = express();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.use(express.json());

app.use("/users", userRouter);

app.listen(process.env.PORT || 5000);
