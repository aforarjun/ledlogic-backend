import jwt from "jsonwebtoken";

import ErrorHandler from "../utils/ErrorHandler.js";
import CatchAsyncError from "./CatchAsyncError.js";
import User from "../models/UserModel.js";

export const isAuthenticatedUser = CatchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SEC_KEY);

  req.user = await User.findById(decodedData.id);

  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resouce`,
          403
        )
      );
    }

    next();
  };
};
