import { register, login, logout } from "../controller/authController.js";
import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";

export default function registerAuthRoutes(server) {
  server.route([
    {
      path: "/api/auth/register",
      method: "POST",
      handler: register,
      options: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/api/auth/login",
      handler: login,
      options: {
        auth: false,
      },
    },
    {
      path: "/api/auth/logout",
      method: "POST",
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
      handler: logout,
    },
  ]);
}
