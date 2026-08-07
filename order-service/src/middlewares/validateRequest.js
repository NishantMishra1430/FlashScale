// src/middlewares/validateRequest.js
export const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({ body: req.body });
    next();
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
  }
};
