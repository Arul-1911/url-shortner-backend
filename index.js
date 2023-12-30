require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const passwordResetRoute = require("./routes/passwordReset");
const bodyparser = require("body-parser");
const { UrlModel } = require("./models/urlschema");

//middlewares
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));

//getting home file content using ejs view engine
app.get("/url", async (req, res) => {
  try {
    const allUrl = await UrlModel.find();

    res.render("home", {
      urlResult: allUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//creating a short url
app.post("/create", async (req, res) => {
  try {
    let urlShort = new UrlModel({
      longUrl: req.body.longurl,
      shortUrl: generateUrl(),
    });

    const data = await urlShort.save();

    res.redirect("/url");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//redirecting to the shorturl to longurl

app.get("/:urlId", async (req, res) => {
  try {
    const data = await UrlModel.findOne({ shortUrl: req.params.urlId });

    if (!data) {
      // Short URL not found in the database
      return res.status(404).send("Not Found");
    }
    const count = await UrlModel.findByIdAndUpdate(
      { _id: data._id },
      { $inc: { clickCount: 1 } }
    );

    if (!count) {
      return res.status(404).send("Error in Total clicks");
    }
    // Redirect to the long URL
    res.redirect(data.longUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//function to delete
app.get("/delete/:id", async (req, res) => {
  try {
    const remove = await UrlModel.findByIdAndDelete({ _id: req.params.id });
    if (!remove) {
      res.status(400).send("Error in deletion");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error in deleting");
  }
  res.redirect("/url");
});

//function for random url genrerator
function generateUrl() {
  let rndResult = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (var i = 0; i < 4; i++) {
    rndResult += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return rndResult;
}
//database conncetion
connection();

//routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/password-reset", passwordResetRoute);

//PORT
const port = process.env.PORT;
app.listen(port, () => console.log(`Port listening in ${port}..`));
