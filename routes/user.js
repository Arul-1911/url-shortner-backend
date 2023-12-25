const router = require("express").Router();
const { User, validate } = require("../models/index");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {
        // Validation of the incoming request body
        const { error } = validate(req.body);

        if (error) {
            // If validation fails, send a 400 Bad Request with details
            return res.status(400).send({ message: error.details[0].message });
        }

        // Check if a user with the provided email already exists
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            // If user already exists, send a 409 Conflict status
            return res.status(409).send({ message: "User email already exists" });
        }

        // Generate a salt and hash the provided password
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new User document with the hashed password
        await new User({ ...req.body, password: hashedPassword }).save();

        // Send a 201 Created status if the user is successfully created
        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        // Log the error and send a 500 Internal Server Error status
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

module.exports = router;
