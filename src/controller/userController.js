import { getAuth } from "firebase/auth";
import { firebaseApp } from "../config/firebaseConfig.js";
import { db } from "../config/firebaseConfig.js";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const auth = getAuth(firebaseApp);

export async function createUserProfile(request, h) {
  try {
    const { name, age, gender, currentHeight, currentWeight, goal } =
      request.payload;

    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to create a profile",
        })
        .code(401);
    } else {
      const data = {
        name: name,
        age: age,
        gender: gender,
        currentHeight: currentHeight,
        currentWeight: currentWeight,
        goal: goal,
      };

      const docRef = doc(db, "Users", user.uid);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        return h
          .response({
            status: 409,
            message: "User profile already created.",
          })
          .code(409);
      }

      await setDoc(docRef, data);

      return h
        .response({
          status: 201,
          message: "User profile created successfully.",
        })
        .code(201);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message: "An error occurred. Please try again later.",
      })
      .code(500);
  }
}

export async function getUserProfile(request, h) {
  try {
    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to see your profile",
        })
        .code(401);
    } else {
      const docRef = doc(db, "Users", user.uid);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        return h
          .response({
            status: 200,
            data: userData,
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
    const { name, age, gender, currentHeight, goal } = request.payload;

    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to update your profile",
        })
        .code(401);
    } else {
      const updateData = {};

      if (name) updateData.name = name;
      if (age) updateData.age = age;
      if (gender) updateData.gender = gender;
      if (currentHeight) updateData.currentHeight = currentHeight;
      if (goal) updateData.goal = goal;

      const docRef = doc(db, "Users", user.uid);
      await updateDoc(docRef, updateData);

      return h
        .response({
          status: 200,
          message: "User profile updated successfully.",
        })
        .code(200);
    }
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
    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to calculate BMI",
        })
        .code(401);
    } else {
      const docRef = doc(db, "Users", user.uid);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const heightInMeters = userData.currentHeight / 100;
        const bmi = userData.currentWeight / (heightInMeters * heightInMeters);
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
