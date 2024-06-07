import {
  createDietPlan,
  getDietPlan,
  updateDietPlan,
} from "../controller/dietPlanController.js";
import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";
import { getDietPlanService } from "../services/dietPlanService.js";

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
      handler: getDietPlanService,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/diet-plan",
      method: "PUT",
      handler: updateDietPlan,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    }
  ]);
}
