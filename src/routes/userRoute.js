import {
  calculateBMI,
  getUserProfile,
  updateEmailPassUser,
  updateUserProfile,
} from "../controller/userController.js";
import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";

export default function registerUserRoutes(server) {
  server.route([
    {
      path: "/api/user-profile",
      method: "GET",
      handler: getUserProfile,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/user-profile",
      method: "PUT",
      handler: updateUserProfile,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/user-profile/bmi",
      method: "GET",
      handler: calculateBMI,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/profile",
      method: "PUT",
      handler: updateEmailPassUser,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
}
