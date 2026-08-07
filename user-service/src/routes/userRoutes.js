// src/routes/userRoutes.js
import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { signupSchema, loginSchema } from "../validators/userValidator.js";

const router = Router();

// Notice: Routes do not have a prefix here. The API Gateway will forward
// requests to these routes based on its own prefix mappings.
router.post("/signup", validateRequest(signupSchema), userController.signup);
router.post("/login", validateRequest(loginSchema), userController.login);

export default router;
