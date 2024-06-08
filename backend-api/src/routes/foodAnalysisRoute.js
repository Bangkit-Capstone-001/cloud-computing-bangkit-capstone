import { createUserFoodHistory, getAllFoods, getFoodByName } from "../controller/foodAnalysisController.js";
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
    {
      path: "/api/food-analysis/name/{foodName}",
      method: "GET",
      handler: getFoodByName,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/food-analysis/foods/all",
      method: "GET",
      handler: getAllFoods,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
}
