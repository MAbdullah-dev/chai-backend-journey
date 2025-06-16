import mongoose from "mongoose";
const subtodo = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true,
            "Description is required"
        ],
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    todoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo",
        required: true,
    },
    createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, { timestamps: true
})

export const SubTodo = mongoose.model("SubTodo", subtodo);