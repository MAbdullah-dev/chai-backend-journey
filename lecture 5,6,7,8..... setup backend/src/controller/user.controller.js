import { asyncHandler } from "../utils/asyncHandler.js";
import APIError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false
        });

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new APIError(500, "Something went wrong")

    }

}
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
    const coverLocalPath = req.files?.coverimage?.[0]?.path || null;
    // console.log(req.files);

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar is required")
    };

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!avatar) {
        throw new APIError(400, "Avatar is required")
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverimage: coverImage?.url || ""
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new APIError(500, "User not created")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created",)
    )


});
const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // check username and email 
    // check if user exist
    // check password
    // access token and refresh token
    // save in sucre cookie
    // return response
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new APIError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new APIError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new APIError(401, "Password is incorrect")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggnedInUser = await User.findById(user._id).select("-password -refreshToken");

    const option = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(200, {
                user: loggnedInUser, accessToken, refreshToken
            },
                "User logged in"
            )
        )
})
const logoutUser = asyncHandler(async (req, res) => {
    // find user
    // remove access token and refresh token
    // remove cookie
    // return response

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },

        }, {
        new: true
    }
    )
    const option = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new APIError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?.id);

        if (!user) {
            throw new APIError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new APIError(401, "Refresh token is expired or has been reused");
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 // Optional: 7 days
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user.id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid refresh token");
    }
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new APIError(400, "All fields are required")
    }
    const user = await User.findById(req.user._id)

    if (!user) {
        throw new APIError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if (!isPasswordCorrect) {
        throw new APIError(401, "Current password is incorrect")
    }

    if (newPassword !== confirmPassword) {
        throw new APIError(400, "New password and confirm password do not match")
    }

    user.password = newPassword
    await user.save({
        validateBeforeSave: false
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Password changed successfully"
            )
        )
})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User details fetched successfully"
            )
        )
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    // update user details
    // return response
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new APIError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select
        (
            "-password -refreshToken"
        )

    if (!user) {
        throw new APIError(404, "User not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Account details updated successfully"
            )
        )
})
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath); // ✅ await here

    if (!avatar?.url) {
        throw new APIError(500, "Error uploading avatar");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    );

    if (!updatedUser) {
        throw new APIError(404, "User not found");
    }

    const user = updatedUser.toObject();
    delete user.password;
    delete user.refreshToken;

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    );
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new APIError(400, "Cover image is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath); // ✅ await here

    if (!coverImage?.url) {
        throw new APIError(500, "Error uploading cover image");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverimage: coverImage.url } },
        { new: true }
    );

    if (!updatedUser) {
        throw new APIError(404, "User not found");
    }

    const user = updatedUser.toObject();
    delete user.password;
    delete user.refreshToken;

    return res.status(200).json(
        new ApiResponse(200, user, "Cover image updated successfully")
    );
});



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}


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