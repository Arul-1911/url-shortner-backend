const router = require("express").Router();
const { User } = require("../models/index");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require("bcrypt");

//send password link

router.post("/", async (req, res) => {
	try {
		const emailSchema = Joi.object({
			email: Joi.string().email().required().label("Email"),
		});
		const { error } = emailSchema.validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		let user = await User.findOne({ email: req.body.email });
		if (!user)
			return res
				.status(409)
				.send({ message: "User with given email does not exist!" });

		let token = await Token.findOne({ userId: user._id });
		if (!token) {
			token = await new Token({
				userId: user._id,
				token: crypto.randomBytes(32).toString("hex"),
			}).save();
		}

		// const url = `${process.env.BASE_URL}password-reset/${user._id}/${token.token}/`;
    const url = `https://cheerful-cajeta-d59fab.netlify.app/api/password-reset/${user._id}/${token.token}/`;//to add frontend url deployed
    
		await sendEmail(user.email, "Password Reset", url);

		res
			.status(200)
			.send({ message: "Password reset link sent to your email account" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

//verify url

router.get("/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    console.log(user)
    if (!user) return res.status(400).send({ message: "Invalid Link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) return res.status(400).send({ message: "Token Doesn't Exist" });

//redirect funtion to show password reset component


//  res.redirect(`http://localhost:3000/password-reset/${user._id}/${token.token}`);

    res.status(200).send({ message: "Valid url" });  // password issue line..

    //new gbt code
    // const resetUrl = `http://localhost:3000/password-reset/${user._id}/${token.token}`;

    // // Uncomment the line below if you want to redirect to the reset URL
    // // res.redirect(resetUrl);

    // // Alternatively, you can include the reset URL in the response
    // res.status(200).send({ message: "Valid url", resetUrl });


  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

//reset password

router.post("/:id/:token", async (req, res) => {
  try {
    const passwordSchema = Joi.object({
      password: passwordComplexity().required().label("Password"),
    });

    const { error } = passwordSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid Link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) return res.status(400).send({ message: "Token Doesn't Exist" });

    // res.status(200).send({message:"Valid url"}); // commented based on gbt

    if (!user.verified) user.verified = true;

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashPassword;
    await user.save();
    // await token.remove();
     await Token.findOneAndDelete({
      userId: user._id,
      token: req.params.token,
    });

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
