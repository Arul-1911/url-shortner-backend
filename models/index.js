const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const passwordComplexity = require("joi-password-complexity");

// Creating a Mongoose schema for the user
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});

// Adding a method to the user schema to generate authentication tokens
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, { expiresIn: "1d" });
    return token;
};

// Creating a Mongoose model for the user schema
const User = mongoose.model("user", userSchema);

// Validation function using Joi for user data
const validate = (data) => {
    const schema = joi.object({
        firstName: joi.string().required().label("First Name"),
        lastName: joi.string().required().label("Last Name"),
        email: joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
    });

    return schema.validate(data);
};

// Exporting the User model and validation function
module.exports = { User, validate };
