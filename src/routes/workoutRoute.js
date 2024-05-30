import { validateFirebaseIdToken } from "../middleware/authMiddleware.js";
import { getRandomWorkout } from "../controller/workoutController.js";

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
  ]);
}
