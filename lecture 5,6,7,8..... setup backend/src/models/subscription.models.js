import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one how is subscribing
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscibe, is subscribing
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);