import mongoose from "mongoose";

export default function connectDB() {
    mongoose.connect("mongodb://localhost:27017/razorpay")
        .then(() => {
            console.log("Connected to database")
        })
        .catch((err) => {
            console.log(err)
        })
}