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
    where("bodyGroup", "==", bodyGroup),
    where("option", "==", option)
  );
  const workoutsSnapshot = await getDocs(workoutsQuery);
  const workouts = [];
  workoutsSnapshot.forEach((doc) => {
    workouts.push(doc.data());
  });
  return workouts;
}

async function getFullBodyWorkout(numOfWorkout, option, h) {
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

  const selectedUpperWorkouts = upperWorkouts
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(numOfWorkout / 2));
  const selectedLowerWorkouts = lowerWorkouts
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(numOfWorkout / 2));

  return [...selectedUpperWorkouts, ...selectedLowerWorkouts];
}

async function getUpperOrLowerBodyWorkout(numOfWorkout, target, option, h) {
  const workouts = await fetchWorkoutsByGroupAndOption(target, option);

  if (workouts.length === 0) {
    return h
      .response({
        status: 404,
        message: "No workouts found matching the criteria.",
      })
      .code(404);
  }

  return workouts.sort(() => 0.5 - Math.random()).slice(0, numOfWorkout);
}

export async function getRandomWorkout(request, h) {
  try {
    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to get random workouts.",
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
        selectedWorkouts = await getFullBodyWorkout(numOfWorkout, option, h);
      } else {
        selectedWorkouts = await getUpperOrLowerBodyWorkout(
          numOfWorkout,
          target,
          option,
          h
        );
      }

      return h
        .response({
          status: 200,
          message: `Retrieved random ${selectedWorkouts.length} of ${target} Body and ${option}`,
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
