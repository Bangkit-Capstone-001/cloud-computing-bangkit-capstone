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

import {
  addUserWeightService,
  getAllUserWeightHistoriesService,
} from "../services/trackerService.js";

const auth = getAuth(firebaseApp);

export async function addUserWeight(request, h) {
  try {
    const { weight, date } = request.payload;
    const user = auth.currentUser;
    const today = new Date();

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to add weight data",
        })
        .code(401);
    } else if (!weight || !date) {
      return h
        .response({
          status: 400,
          message: "Please provide both weight and date",
        })
        .code(400);
    } else if (new Date(date) > today) {
      return h
        .response({
          status: 400,
          message: "The date cannot be in the future",
        })
        .code(400);
    } else {
      const userRef = doc(db, "Users", user.uid);
      await addUserWeightService(userRef, weight, date, today);

      return h
        .response({
          status: 200,
          message: "Weight data added successfully.",
        })
        .code(200);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while updating your weight. Please try again later.",
      })
      .code(500);
  }
}

export async function getAllUserWeightHistories(request, h) {
  try {
    const user = auth.currentUser;

    if (!user) {
      return h
        .response({
          status: 401,
          message: "You must be logged in to access weight history.",
        })
        .code(401);
    } else {
      const userRef = doc(db, "Users", user.uid);
      const weightHistoryData = await getAllUserWeightHistoriesService(userRef);

      return h
        .response({
          status: 200,
          message:
            weightHistoryData.length === 0
              ? "No Weight histories found"
              : `${weightHistoryData.length} weight histories found for your profile.`,
          data: weightHistoryData,
        })
        .code(200);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message:
          "An error occurred while retrieving weight history. Please try again later.",
      })
      .code(500);
  }
}
