const mongoose = require('mongoose');
require('dotenv').config()

module.exports = async () => {
    try {
        await mongoose.connect(process.env.DB);

        console.log("DB Connected");
    } catch (error) {
        console.error("Error in connecting to the database:", error);
    }
};
