import { getAuth, updateEmail, updatePassword } from "firebase/auth";
import { firebaseApp } from "../config/firebaseConfig.js";
import { db } from "../config/firebaseConfig.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { bmiCalculator } from "../services/trackerService.js";

export async function getUserProfile(request, h) {
  try {
    const { uid } = request.auth;

    const docRef = doc(db, "Users", uid);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      let bmiCategory = "";
      const bmi = userData.bmi;
      if (bmi < 18.5) {
        bmiCategory = "Underweight";
      } else if (bmi >= 18.5 && bmi < 24.9) {
        bmiCategory = "Normal weight";
      } else if (bmi >= 25 && bmi < 29.9) {
        bmiCategory = "Overweight";
      } else if (bmi >= 30) {
        bmiCategory = "Obese";
      }
      return h
        .response({
          status: 200,
          message: "User profile retrieved successfully",
          data: { ...userData, bmiCategory },
        })
        .code(200);
    } else {
      return h
        .response({
          status: 404,
          message: "User profile does not exist",
        })
        .code(404);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message: "An error occurred while retrieving user profile.",
      })
      .code(500);
  }
}

export async function updateUserProfile(request, h) {
  try {
    const {
      name,
      age,
      gender,
      currentHeight,
      currentWeight,
      goal,
      activityLevel,
    } = request.payload;

    const { uid } = request.auth;
    const updateData = {};

    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (currentHeight) updateData.currentHeight = currentHeight;
    if (currentWeight) updateData.currentWeight = currentWeight;
    if (gender) {
      const validGenders = ["Male", "Female"];
      if (!validGenders.includes(gender)) {
        return h
          .response({
            status: 400,
            message: "Gender can only be Male or Female!",
          })
          .code(400);
      }
      updateData.gender = gender;
    }
    if (goal) {
      const validGoals = ["weightLoss", "weightMaintain", "weightGain"];
      if (!validGoals.includes(goal)) {
        return h
          .response({
            status: 400,
            message:
              "Goal can only be weightLoss, weightMaintain or weightGain!",
          })
          .code(400);
      }
      updateData.goal = goal;
    }
    if (activityLevel) {
      const validActivityLevels = ["sedentary", "light", "moderate", "active"];
      if (!validActivityLevels.includes(activityLevel)) {
        return h
          .response({
            status: 400,
            message:
              "Activity level can only be sedentary, light, moderate or active!",
          })
          .code(400);
      }
      updateData.activityLevel = activityLevel;
    }

    if (currentHeight) {
      const docRef = doc(db, "Users", uid);
      const docSnapshot = await getDoc(docRef);
      const userData = docSnapshot.data(); //ini

      const { bmi } = await bmiCalculator(
        currentHeight,
        userData.currentWeight
      );
      updateData.bmi = bmi;
    }
    const docRef = doc(db, "Users", uid);
    await updateDoc(docRef, updateData);

    return h
      .response({
        status: 200,
        message: "User profile updated successfully.",
      })
      .code(200);
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while updating your profile. Please try again later.",
      })
      .code(500);
  }
}

export async function calculateBMI(request, h) {
  try {
    const { uid } = request.auth;

    const docRef = doc(db, "Users", uid);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();

      if (userData.bmi === undefined) {
        return h
          .response({
            status: 400,
            message:
              "Your bmi data is missing. Please input your weight to proceed.",
          })
          .code(400);
      }

      const bmi = userData.bmi;

      let bmiCategory = "";
      if (bmi < 18.5) {
        bmiCategory = "Underweight";
      } else if (bmi >= 18.5 && bmi < 24.9) {
        bmiCategory = "Normal weight";
      } else if (bmi >= 25 && bmi < 29.9) {
        bmiCategory = "Overweight";
      } else if (bmi >= 30) {
        bmiCategory = "Obese";
      }

      return h
        .response({
          status: 200,
          data: {
            bmi: bmi,
            category: bmiCategory,
          },
        })
        .code(200);
    } else {
      return h
        .response({
          status: 404,
          message: "User profile does not exist",
        })
        .code(404);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message: "An error occurred while calculating BMI.",
      })
      .code(500);
  }
}

export async function updateEmailPassUser(request, h) {
  try {
    const { email, password } = request.payload;

    getAuth(firebaseApp).updateCurrentUser;

    const user = auth.currentUser;

    if (!email || !password) {
      return h
        .response({
          status: 400,
          message: "Email and password are required.",
        })
        .code(400);
    }
    await updateEmail(user, email);
    await updatePassword(user, password);

    return h
      .response({
        status: 200,
        message: "Email and password updated successfully.",
      })
      .code(200);
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while updating your email and password. Please try again later.",
        error: error.message,
      })
      .code(500);
  }
}
