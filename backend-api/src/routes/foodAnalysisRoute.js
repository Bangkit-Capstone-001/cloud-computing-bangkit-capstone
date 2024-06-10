import {
  createUserFoodHistory,
  getAllFoods,
  getFoodByName,
  getRandomFoods,
  getTodayFoods,
} from "../controller/foodAnalysisController.js";
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
    {
      path: "/api/food-analysis/foods",
      method: "GET",
      handler: getRandomFoods,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/food-analysis/today",
      method: "GET",
      handler: getTodayFoods,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
}
