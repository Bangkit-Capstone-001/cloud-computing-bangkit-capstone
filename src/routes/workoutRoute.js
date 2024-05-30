import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";
import {
  getRandomWorkout,
  getAllWorkoutByTargetAndOption,
} from "../controller/workoutController.js";

export default function registerWorkoutRoutes(server) {
  server.route([
    {
      path: "/api/workout/random",
      method: "GET",
      handler: getRandomWorkout,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/workout",
      method: "GET",
      handler: getAllWorkoutByTargetAndOption,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
}
