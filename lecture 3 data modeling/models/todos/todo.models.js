import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    subtodos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubTodoS",
        }
    ],
}, { timestamps: true });

export const Todo = mongoose.model("Todo", todoSchema);