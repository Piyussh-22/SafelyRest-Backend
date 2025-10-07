export const errorHandler = (err, req, res, next) => {
  console.error("💥 Server Error:", err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
