const mongoose = require('mongoose');

const connectDB = async () => {
    if(
        await mongoose.connect(process.env.MONGO_URI,
))
    {
        await console.log('MongoDB connected');

    }
    else {
        console.log('MongoDB connection failed');
        process.exit(1);
    }
}

module.exports = connectDB;