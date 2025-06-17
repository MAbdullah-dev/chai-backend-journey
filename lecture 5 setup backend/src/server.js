import mongoose from "mongoose";
import { DB_NAME } from "./constant";

import express from "express";
const app = express();

(
    async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
            app.on("error", () => {
                console.log("ERROR :", error);
                throw error
            })
            app.listen(process.env.PORT, () => {
                console.log(`App is listening ${process.env.PORT}`);
                
            })
        } catch (error) {
            console.error("ERROR:", error);
            
        }
    }
)()