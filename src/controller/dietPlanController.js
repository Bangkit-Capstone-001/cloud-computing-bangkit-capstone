import { getAuth } from "firebase/auth";
import { firebaseApp } from "../config/firebaseConfig.js";
import { db } from "../config/firebaseConfig.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  createDietPlanService,
  getDietPlanService,
} from "../services/dietPlanService.js";

const auth = getAuth(firebaseApp);

export async function getDietPlan(request, h) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to get a diet plan",
        })
        .code(401);
    }

    const userRef = doc(db, "Users", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return h
        .response({
          status: 404,
          message: "User profile does not exist",
        })
        .code(404);
    }

    const userDietPlan = await getDietPlanService(userRef);
    if (!userDietPlan) {
      return h
        .response({
          status: 404,
          message: "Diet plan not found",
        })
        .code(404);
    }

    return h
      .response({
        status: 200,
        message: "Diet plan retrieved successfully",
        data: userDietPlan,
      })
      .code(200);
  } catch (error) {
    console.log(error);
    return h
      .response({
        status: 500,
        message: "An error occurred. Please try again later.",
      })
      .code(500);
  }
}

export async function createDietPlan(request, h) {
  try {
    const { weightTarget, duration } = request.payload;
    const user = auth.currentUser;

    if (!duration) {
      duration = 30;
    }

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to create a diet plan",
        })
        .code(401);
    } else if (!weightTarget) {
      return h
        .response({
          status: 400,
          message: "Please provide both weightTarget",
        })
        .code(400);
    } else {
      const userRef = doc(db, "Users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        return h
          .response({
            status: 404,
            message: "User profile does not exist",
          })
          .code(404);
      }
      const userData = userSnapshot.data();

      const { currentWeight, currentHeight, age, gender, goal } = userData;
      let bmr, calorie;

      console.log(currentWeight, currentHeight, age, gender, goal);

      if (gender === "Female") {
        bmr = 66.5 + 13.75 * currentWeight + 5.003 * currentHeight - 6.75 * age;
      } else {
        bmr =
          655.1 + 9.563 * currentWeight + 1.85 * currentHeight - 4.676 * age;
      }

      //   TODO: Calculate calorie based on activity level

      if (goal === "weightGain") {
        calorie = bmr + (weightTarget * 7000) / duration;
      } else if (goal === "weightLoss") {
        calorie = bmr - (7700 * weightTarget) / duration;
      } else {
        calorie = bmr;
      }

      createDietPlanService(userRef, {
        weightTarget,
        duration,
        calorie,
      });

      // TODO: Handle kasus kalo kalorie negatif / MATI

      return h
        .response({
          status: 201,
          message: "Diet plan created successfully.",
          data: {
            weightTarget,
            duration,
            calorie,
          },
        })
        .code(201);
    }
  } catch (error) {
    console.log(error);
    return h
      .response({
        status: 500,
        message: "An error occurred. Please try again later.",
      })
      .code(500);
  }
}
