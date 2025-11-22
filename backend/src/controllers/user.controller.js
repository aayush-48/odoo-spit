import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const avatarPath = req.files?.avatar?.[0]?.path;
    const coverPath = req.files?.coverImage?.[0]?.path;

    if (!avatarPath) {
      return res.status(400).json({ success: false, message: "Avatar is required" });
    }

    const avatar = await uploadOnCloudinary(avatarPath);
    const cover = coverPath ? await uploadOnCloudinary(coverPath) : null;

    const user = await User.create({
      fullname,
      username: username.toLowerCase(),
      email,
      password,
      avatar: avatar.url,
      coverImage: cover?.url || ""
    });

    const cleanUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(201).json({
      success: true,
      data: cleanUser,
      message: "User registered successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({ success: false, message: "Username or email required" });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    const valid = await user.isPasswordCorrect(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
      .json({
        success: true,
        data: { user: await User.findById(user._id).select("-password -refreshToken"), accessToken, refreshToken },
        message: "Logged in successfully"
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incoming = req.cookies.refreshToken || req.body.refreshToken;

    if (!incoming) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded?._id);
    if (!user || user.refreshToken !== incoming) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
      .json({
        success: true,
        data: { accessToken, refreshToken },
        message: "Token refreshed successfully"
      });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};

export const updateAccountDetails = async (req, res) => {
  try {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { fullname, email },
      { new: true }
    ).select("-password -refreshToken");

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserAvatar = async (req, res) => {
  try {
    const path = req.file?.path;
    if (!path) {
      return res.status(400).json({ success: false, message: "Avatar is required" });
    }

    const uploaded = await uploadOnCloudinary(path);

    const user = await User.findById(req.user._id);
    const old = user.avatar;
    user.avatar = uploaded.url;
    await user.save();

    if (old) await deleteFromCloudinary(old);

    const clean = user.toObject();
    delete clean.password;
    delete clean.refreshToken;

    res.status(200).json({ success: true, data: clean });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserCoverImage = async (req, res) => {
  try {
    const path = req.file?.path;
    if (!path) {
      return res.status(400).json({ success: false, message: "Cover image required" });
    }

    const uploaded = await uploadOnCloudinary(path);

    const user = await User.findById(req.user._id);
    const old = user.coverImage;
    user.coverImage = uploaded.url;
    await user.save();

    if (old) await deleteFromCloudinary(old);

    const clean = user.toObject();
    delete clean.password;
    delete clean.refreshToken;

    res.status(200).json({ success: true, data: clean });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
