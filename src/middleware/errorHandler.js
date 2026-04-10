export function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
}

export function errorHandler(err, req, res, next) {
  console.error("[Error]", err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
}
