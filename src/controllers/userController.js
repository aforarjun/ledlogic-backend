import CatchAsyncError from "../middlewares/CatchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../models/UserModel.js";
import sentToken from "../utils/JwtAuthToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// Register User
export const register = CatchAsyncError(async (req, res, next) => {
  const { password, ...otherUser } = req.body;

  const user = await User.create({
    password,
    ...otherUser,
    avatar: {
      public_id: "This is demo",
      url: "profilepicurl",
    },
  });

  sentToken(user, 201, res);
});

// LOGIN User
export const login = CatchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Email or Password", 401));

  const isPasswordMatch = user.comparePassword(password);

  if (!isPasswordMatch)
    return next(new ErrorHandler("Invalid Email or Password", 401));

  sentToken(user, 200, res);
});

// LOGOUT User
export const logOut = CatchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// FORGOT PASSWORD
export const forgotPassword = CatchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Get RESET_PASSWORD TOKEN
  const resetPasswordToken = user.getResetPasswordToken();
  console.log(resetPasswordToken);

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetPasswordToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// RESET PASSWORD
export const resetPassword = CatchAsyncError(async (req, res, next) => {
  // Hashing the token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  // user not found
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been exprired",
        400
      )
    );
  }

  // if user found but password and confirm password not patched
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and confirm password is not matched", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // coz user changes the password => we can allow user to login
  sentToken(user, 200, res);
});

// GET USER Details - Admin / User
export const getUserDetaila = CatchAsyncError(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  res.status(200).json({
    success: true,
    user,
  });
});

// Get All Users - ADMIN
export const getAllUsers = CatchAsyncError(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(
      new ErrorHandler(
        "No users is registerd or you are not allowed to access",
        400
      )
    );
  }

  res.status(200).json({
    success: true,
    users,
  });
});

// UPDATE USER DETAILS - LoggedIn User
export const updateUser = CatchAsyncError(async (req, res, next) => {
  const { params, body } = req;

  const user = await User.findById(params.userId);

  user = await User.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

// UPDATE User Password - LoggedIn User
export const updatePassword = CatchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { userId } = req.params;

  const user = await User.findById(userId).select("+password");

  const isPasswordMatch = await user.comparePassword(oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("new password is not matched with confirm password", 400)
    );
  }

  user.password = newPassword;

  await user.save();

  sentToken(user, 200, res);
});

// Delete a User - LoggedIn User
export const deleteUser = CatchAsyncError(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  await user.delete();

  res.status(200).json({
    success: true,
    message: "User has been deleted successfully.",
  });
});
