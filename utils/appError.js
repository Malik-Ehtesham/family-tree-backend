class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// This class makes an error object from the given data,
// then the object is passed through the globalErrorHandler(error.js file in Controllers folder)
//  and the eroor is send from there in response

// SYNCHORONOUS ERRORS
// 1) AppError class is used to create an error object in the same function where the error is occured
// 2) Then the error object go in GEH and a response is send to user from GEH file.

// ASYNCHORONOUS ERRORS
// 1) CatchAsync catch the error and send it to global error handler
// 2) GlobalEH Handle the error according to its type and make a readable message for the user
// 3) Then AppError class is used and an error object is created and then the object is send in response to user from the same GEH file

module.exports = AppError;
