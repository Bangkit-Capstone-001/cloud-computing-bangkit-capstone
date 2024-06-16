import { firebaseApp } from "../config/firebaseConfig.js";
import { db } from "../config/firebaseConfig.js";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  createOrUpdateDietPlanService,
  getDietPlanService,
  getTodayTotalCalories,
} from "../services/dietPlanService.js";

export async function getDietPlan(request, h) {
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
    const { currentWeight, goal } = userSnapshot.data();

    const userDietPlan = await getDietPlanService(userRef);
    if (!userDietPlan) {
      return h
        .response({
          status: 404,
          message: "Diet plan not found",
        })
        .code(404);
    }

    const calorieEaten = await getTodayTotalCalories(userRef);
    return h
      .response({
        status: 200,
        message: "Diet plan retrieved successfully",
        data: {
          ...userDietPlan,
          currentWeight: parseInt(currentWeight),
          calorieEaten,
          remainingCalories: Math.max(userDietPlan.calorie - calorieEaten, 0),
          goal,
        },
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
    const { uid } = request.auth;

    if (!duration) {
      duration = 30;
    }

    if (!weightTarget) {
      return h
        .response({
          status: 400,
          message: "Please provide both weightTarget",
        })
        .code(400);
    } else {
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
      const userData = userSnapshot.data();

      const { currentWeight, currentHeight, age, gender, goal, activityLevel } =
        userData;
      let bmr, calorie;

      console.log(currentWeight, currentHeight, age, gender, goal);

      if (gender === "Female") {
        bmr = 66.5 + 13.75 * currentWeight + 5.003 * currentHeight - 6.75 * age;
      } else {
        bmr =
          655.1 + 9.563 * currentWeight + 1.85 * currentHeight - 4.676 * age;
      }

      if (activityLevel === "sedentary") {
        bmr *= 1.2;
      } else if (activityLevel === "light") {
        bmr *= 1.375;
      } else if (activityLevel === "moderate") {
        bmr *= 1.55;
      } else if (activityLevel === "active") {
        bmr *= 1.725;
      }

      if (goal === "weightGain") {
        calorie = bmr + (weightTarget * 7000) / duration;
      } else if (goal === "weightLoss") {
        calorie = bmr - (7700 * weightTarget) / duration;
      } else {
        calorie = bmr;
      }

      if (calorie < 1100) {
        // Kalo kalori kurang dari 1100 dipatok jadi segitu (biar tetep sehat)
        calorie = 1100;
      }

      createOrUpdateDietPlanService(userRef, {
        weightTarget: parseInt(weightTarget),
        duration: parseInt(duration),
        calorie,
      });

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

export async function updateDietPlan(request, h) {
  let { weightTarget, duration } = request.payload;

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

    const userDietPlanRef = collection(userRef, "DietPlan");
    const userDietPlanCollection = await getDocs(userDietPlanRef);

    if (userDietPlanCollection.empty) {
      return h
        .response({
          status: 404,
          message: "Diet plan does not exist",
        })
        .code(404);
    }

    const userDietPlanSnapshot = userDietPlanCollection.docs[0];

    const userData = userSnapshot.data();
    const { currentWeight, currentHeight, age, gender, goal, activityLevel } =
      userData;

    if (!weightTarget) weightTarget = userDietPlanSnapshot.data().weightTarget;
    if (!duration) duration = userDietPlanSnapshot.data().duration;

    let bmr, calorie;

    if (gender === "Female") {
      bmr = 655.1 + 9.563 * currentWeight + 1.85 * currentHeight - 4.676 * age;
    } else {
      bmr = 66.5 + 13.75 * currentWeight + 5.003 * currentHeight - 6.75 * age;
    }

    if (activityLevel === "sedentary") {
      bmr *= 1.2;
    } else if (activityLevel === "light") {
      bmr *= 1.375;
    } else if (activityLevel === "moderate") {
      bmr *= 1.55;
    } else if (activityLevel === "active") {
      bmr *= 1.725;
    }

    if (goal === "weightGain") {
      calorie = bmr + (weightTarget * 7000) / duration;
    } else if (goal === "weightLoss") {
      calorie = bmr - (7700 * weightTarget) / duration;
    } else {
      calorie = bmr;
    }

    if (calorie < 1100) {
      calorie = 1100;
    }

    await createOrUpdateDietPlanService(userRef, {
      weightTarget,
      duration,
      calorie,
    });

    return h
      .response({
        status: 200,
        message: "Diet plan updated successfully",
        data: {
          weightTarget,
          duration,
          calorie,
        },
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
