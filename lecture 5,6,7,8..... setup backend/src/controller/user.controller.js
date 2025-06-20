import { asyncHandler } from "../utils/asyncHandler.js";
import APIError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty 
    // check if user already exist: check username and email
    // check for images and check for avatar
    // upload them cloudinary (return url),avatar (recheck )
    // create user object - create entry in db 
    // remove assword and refreshtoken from the response
    // check for user creation
    // return response   

    const { username, email, fullname, password } = req.body;
    if (
        [username, email, fullname, password].some((fields) => fields?.trim() === "")
    ) {
        throw new APIError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (existingUser) {
        throw new APIError(
            409,
            "User with same username or email already exist"
        )

    };
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.cover[0]?.path;

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar is required")
    };

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!avatar) {
        throw new APIError(400, "Avatar is required")
    }

    User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        username: username.toLowerCase(),
        email,
        password

    })
    const createdUser = await User.findById(User._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new APIError(500, "User not created")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created",)
    )


    // if (fullname == "") {
    //     throw new APIError(400, "Fullname is required");
    // }
    // if (username == "") {
    //     throw new APIError(400, "Username is required");
    // }
    // if (email == "") {
    //     throw new APIError(400, "Email is required");
    // }
    // if (password == "") {
    //     throw new APIError(400, "Password is required");
    // }






    // res.status(200).json
    //     ({
    //         message: "Register User"
    //     });
});

export { registerUser }