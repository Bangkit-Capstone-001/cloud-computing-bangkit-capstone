import { firebaseApp } from "../config/firebaseConfig.js";
import { db } from "../config/firebaseConfig.js";
import fetch from "node-fetch";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import {
  createWorkoutPlanService,
  deleteUserWorkoutPlanService,
  getAllUserWorkoutPlanService,
  getUserWorkoutPlanByIdService,
  updateUserWorkoutPlanService,
  fetchWorkoutsByGroupAndOptionService,
  getWorkoutPlanByTargetAndOption,
  fetchWorkoutsByName,
} from "../services/workoutPlanService.js";
import config from "../config/config.js";

async function getFullBodyWorkout(option, h) {
  const upperTarget = "Upper";
  const lowerTarget = "Lower";

  const [upperWorkouts, lowerWorkouts] = await Promise.all([
    fetchWorkoutsByGroupAndOptionService(upperTarget, option),
    fetchWorkoutsByGroupAndOptionService(lowerTarget, option),
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
  const workouts = await fetchWorkoutsByGroupAndOptionService(target, option);

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

export async function createWorkoutPlan(request, h) {
  try {
    const { uid } = request.auth;

    const userRef = doc(db, "Users", uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return h
        .response({
          status: 404,
          message: "User profile does not exist",
        })
        .code(404);
    }
    const { workoutIds, days, level, target, option } = request.payload;

    if (!workoutIds || !days) {
      return h
        .response({
          status: 400,
          message: "Workout IDs and days are required",
        })
        .code(400);
    }

    if (!level || !target || !option) {
      return h
        .response({
          status: 400,
          message:
            "Workout level, muscle target, and exercise option are required",
        })
        .code(400);
    }

    const workouts = workoutIds.map((id) => doc(db, "Workouts", id));
    const workoutPlanRef = await createWorkoutPlanService(userRef, {
      level,
      target,
      option,
      days,
      workouts,
    });

    return h
      .response({
        status: 201,
        message: "Workout plan created successfully",
        data: await getUserWorkoutPlanByIdService(userRef, workoutPlanRef.id),
      })
      .code(201);
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while creating a workout plan. Please try again later.",
      })
      .code(500);
  }
}

export async function getAllUserWorkoutPlan(request, h) {
  try {
    const { uid } = request.auth;

    const userRef = doc(db, "Users", uid);
    const workoutPlans = await getAllUserWorkoutPlanService(userRef);

    return h
      .response({
        status: 200,
        message: "Retrieved all workout plans",
        data: workoutPlans,
      })
      .code(200);
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while retrieving workout plans. Please try again later.",
      })
      .code(500);
  }
}

export async function getUserWorkoutPlanById(request, h) {
  try {
    const { uid } = request.auth;

    const userRef = doc(db, "Users", uid);
    const { planId } = request.params;

    const workoutPlan = await getUserWorkoutPlanByIdService(userRef, planId);

    return h
      .response({
        status: 200,
        message: "Retrieved workout plan",
        data: workoutPlan,
      })
      .code(200);
  } catch (error) {
    console.log(error.message);
    if (error.message === "Workout plan does not exist") {
      return h
        .response({
          status: 404,
          message: "Workout plan not found",
        })
        .code(404);
    }
    return h
      .response({
        status: 500,
        message:
          "An error occurred while retrieving the workout plan. Please try again later.",
      })
      .code(500);
  }
}

export async function updateUserWorkoutPlan(request, h) {
  try {
    const { uid } = request.auth;

    const userRef = doc(db, "Users", uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return h
        .response({
          status: 404,
          message: "User profile does not exist",
        })
        .code(404);
    }
    const { workoutIds, days } = request.payload;
    const { planId } = request.params;

    const updateData = {};

    if (workoutIds) {
      updateData.workouts = workoutIds.map((id) => doc(db, "Workouts", id));
    }
    if (days) {
      updateData.days = days;
    }

    await updateUserWorkoutPlanService(userRef, planId, updateData);

    return h
      .response({
        status: 200,
        message: "Workout plan updated successfully",
        data: await getUserWorkoutPlanByIdService(userRef, planId),
      })
      .code(200);
  } catch (error) {
    console.log(error);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while updating a workout plan. Please try again later.",
      })
      .code(500);
  }
}

export async function deleteUserWorkoutPlan(request, h) {
  try {
    const { uid } = request.auth;

    const userRef = doc(db, "Users", uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return h
        .response({
          status: 404,
          message: "User profile does not exist",
        })
        .code(404);
    }
    const { planId } = request.params;

    await deleteUserWorkoutPlanService(userRef, planId);

    return h
      .response({
        status: 200,
        message: "Workout plan deleted successfully",
      })
      .code(200);
  } catch (error) {
    console.log(error);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while deleting a workout plan. Please try again later.",
      })
      .code(500);
  }
}

export async function getWorkoutRecommendations(request, h) {
  try {
    const { uid } = request.auth;

    const userRef = doc(db, "Users", uid);
    const { target, option } = request.query;

    const result = await getWorkoutPlanByTargetAndOption(
      userRef,
      target,
      option
    );

    if (result === null) {
      return h.response({
        status: 200,
        message: "No workout recommendations for you.",
      });
    }

    const workoutNames = result.workouts.map(
      (workout) => workout.exercise_name
    );

    const url = `${config.flaskApiUrl}recommend`;

    const requestBody = {
      body_group: target + " Body",
      exercise_option: option,
      user_favorites: workoutNames,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData = await response.json();
    const recommendations = await fetchWorkoutsByName(responseData);

    return h
      .response({
        status: 200,
        message: `Retrieved ${responseData.length} recommendation of ${target} Body workouts with option ${option}`,
        data: recommendations,
      })
      .code(200);
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message: "Failed to fetch workout recommendations",
      })
      .code(500);
  }
}
