import { createUserFoodHistory } from "../controller/foodAnalysisController.js";
import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";

export default function registerFoodAnalysisRoutes(server) {
  server.route([
    {
      path: "/api/food-analysis",
      method: "POST",
      handler: createUserFoodHistory,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
}
