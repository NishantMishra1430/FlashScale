// src/middlewares/requireAdmin.js
// PLACEHOLDER: In production, the API Gateway verifies the JWT.
// It could inject an 'x-user-role' header before proxying the request here.
export const requireAdmin = (req, res, next) => {
  const role = req.headers["x-user-role"];

  // NOTE: For demonstration. Adapt this based on how the API Gateway forwards user claims.
  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Admin access required to perform this action",
    });
  }

  next();
};
