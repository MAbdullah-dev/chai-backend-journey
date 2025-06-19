// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";

// Load environment variables
dotenv.config({ path: "./.env" });

// Connect to MongoDB, then start the server
connectDB()
    .then(() => {
        app.on("error", (error) => {  // ✅ FIXED: added error parameter
            console.error("Server error:", error);
            throw error;
        });

        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`✅ Server is listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    });










// import mongoose from "mongoose";
// import { DB_NAME } from "./constant";

// import express from "express";
// const app = express();

// (
//     async () => {
//         try {
//             await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//             app.on("error", () => {
//                 console.log("ERROR :", error);
//                 throw error
//             })
//             app.listen(process.env.PORT, () => {
//                 console.log(`App is listening ${process.env.PORT}`);
                
//             })
//         } catch (error) {
//             console.error("ERROR:", error);
            
//         }
//     }
// )()