require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection  = require("./db");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const passwordResetRoute = require("./routes/passwordReset");
const mongoose = require('mongoose');
const mongodb = require('mongodb');

//middlewares
app.use(cors());
app.use(express.json());

//database conncetion 
connection();

//routes
app.use("/api/users", userRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/password-reset",passwordResetRoute);


//PORT
const port = process.env.PORT ;
app.listen(port, () => console.log(`Port listening in ${port}..`));