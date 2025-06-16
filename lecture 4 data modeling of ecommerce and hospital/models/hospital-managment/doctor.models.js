import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    availability: {
        type: String,
        enum: ['Available', 'Unavailable'],
        default: 'Available',
    },
    qualifications: {
        type: [String],
        required: true,
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
    },
    experience: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    timestamps: true,
});

export const Doctor = mongoose.model('Doctor', doctorSchema);
// This code defines a Mongoose schema for a Doctor model in a hospital management system.
