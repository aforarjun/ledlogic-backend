import ErrorHandler from "../utils/ErrorHandler.js";

const Error = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internel server error";

  // wrong MongoDb ID error === Cast Error
  if (err.name === "CastError") {
    const message = `Resourse Not Found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongoose duplicate error key
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json web token is invalid, Try again.`;
    err = new ErrorHandler(message, 400);
  }

  // JWT Expire Error
  if (err.name === "TokenExpiredError") {
    const message = `Json web token is Expired, Try again.`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};

export default Error;
