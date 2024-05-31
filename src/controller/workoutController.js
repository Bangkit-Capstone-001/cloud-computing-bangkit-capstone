import { getAuth } from "firebase/auth";
import { firebaseApp } from "../config/firebaseConfig.js";
import { db } from "../config/firebaseConfig.js";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";

const auth = getAuth(firebaseApp);

async function fetchWorkoutsByGroupAndOption(bodyGroup, option) {
  const workoutsQuery = query(
    collection(db, "Workouts"),
    where("body_group", "==", bodyGroup),
    where("option", "==", option)
  );
  const workoutsSnapshot = await getDocs(workoutsQuery);
  const workouts = [];
  workoutsSnapshot.forEach((doc) => {
    workouts.push(doc.data());
  });
  return workouts;
}

async function getFullBodyWorkout(option, h) {
  const upperTarget = "Upper";
  const lowerTarget = "Lower";

  const [upperWorkouts, lowerWorkouts] = await Promise.all([
    fetchWorkoutsByGroupAndOption(upperTarget, option),
    fetchWorkoutsByGroupAndOption(lowerTarget, option),
  ]);

  if (upperWorkouts.length === 0 || lowerWorkouts.length === 0) {
    return h
      .response({
        status: 404,
        message: "No workouts found matching the criteria.",
      })
      .code(404);
  }

  return [upperWorkouts, lowerWorkouts];
}

async function getUpperOrLowerBodyWorkout(target, option, h) {
  const workouts = await fetchWorkoutsByGroupAndOption(target, option);

  if (workouts.length === 0) {
    return h
      .response({
        status: 404,
        message: "No workouts found matching the criteria.",
      })
      .code(404);
  }

  return workouts;
}

export async function getRandomWorkout(request, h) {
  try {
    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to retrieve random workouts.",
        })
        .code(401);
    } else {
      const { level, target, option } = request.query;
      let numOfWorkout;

      switch (level) {
        case "Beginner":
          numOfWorkout = 10;
          break;
        case "Intermediate":
          numOfWorkout = 14;
          break;
        case "Advance":
          numOfWorkout = 18;
          break;
        default:
          numOfWorkout = 10;
          break;
      }

      let selectedWorkouts;

      if (target == "Full") {
        const [upperWorkouts, lowerWorkouts] = await getFullBodyWorkout(
          option,
          h
        );

        const selectedUpperWorkouts = upperWorkouts
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(numOfWorkout / 2));
        const selectedLowerWorkouts = lowerWorkouts
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(numOfWorkout / 2));

        selectedWorkouts = [...selectedUpperWorkouts, ...selectedLowerWorkouts];
      } else {
        const workout = await getUpperOrLowerBodyWorkout(target, option, h);
        selectedWorkouts = workout
          .sort(() => 0.5 - Math.random())
          .slice(0, numOfWorkout);
      }

      return h
        .response({
          status: 200,
          message: `Retrieved ${selectedWorkouts.length} random ${target} Body workouts with option ${option}`,
          data: selectedWorkouts,
        })
        .code(200);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while retrieving a number of random workout. Please try again later.",
      })
      .code(500);
  }
}

export async function getAllWorkoutByTargetAndOption(request, h) {
  try {
    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to retrieve workouts.",
        })
        .code(401);
    } else {
      const { target, option } = request.query;

      let selectedWorkouts;

      if (target == "Full") {
        const [upperWorkouts, lowerWorkouts] = await getFullBodyWorkout(
          option,
          h
        );

        selectedWorkouts = [...upperWorkouts, ...lowerWorkouts];
      } else {
        selectedWorkouts = await getUpperOrLowerBodyWorkout(target, option, h);
      }

      return h
        .response({
          status: 200,
          message: `Retrieved ${selectedWorkouts.length} ${target} Body workouts with option ${option}`,
          data: selectedWorkouts,
        })
        .code(200);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message: `An error occurred while retrieving ${target} Body workouts with option ${option}. Please try again later.`,
      })
      .code(500);
  }
}
