import {
  createDietPlan,
  getDietPlan,
} from "../controller/dietPlanController.js";
import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";

export default function registerDietPlanRoutes(server) {
  server.route([
    {
      path: "/api/diet-plan",
      method: "POST",
      handler: createDietPlan,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/diet-plan",
      method: "GET",
      handler: getDietPlan,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
}
