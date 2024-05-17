import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../controller/userController.js";
import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";

export default function registerUserRoutes(server) {
  server.route([
    {
      path: "/api/user-profile",
      method: "POST",
      handler: createUserProfile,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
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
  ]);
}
