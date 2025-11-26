const errorHandler = (err, req, res, next) => {
  console.error(err)

  const errorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = {}
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message
    })
    errorResponse.errors = errors
    return res.status(400).json(errorResponse)
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    errorResponse.message = `${field} already exists`
    return res.status(409).json(errorResponse)
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    errorResponse.message = "Invalid token"
    return res.status(401).json(errorResponse)
  }

  if (err.name === "TokenExpiredError") {
    errorResponse.message = "Token expired"
    return res.status(401).json(errorResponse)
  }

  const statusCode = err.statusCode || 500
  res.status(statusCode).json(errorResponse)
}

export default errorHandler
