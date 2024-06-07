import {
  addUserWeight,
  getAllUserWeightHistories,
} from "../controller/trackerController.js";
import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";

export default function registerTrackerRoutes(server) {
  server.route([
    {
      path: "/api/tracker",
      method: "POST",
      handler: addUserWeight,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/tracker",
      method: "GET",
      handler: getAllUserWeightHistories,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
}
