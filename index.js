require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection  = require("./db");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const passwordResetRoute = require("./routes/passwordReset")

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
const port = 7080;
app.listen(port, () => console.log(`Port listening in ${port}..`));