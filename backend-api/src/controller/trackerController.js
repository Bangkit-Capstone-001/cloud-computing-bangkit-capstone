import { firebaseApp } from "../config/firebaseConfig.js";
import { db } from "../config/firebaseConfig.js";
import { doc } from "firebase/firestore";

import {
  addUserWeightService,
  getAllUserWeightHistoriesService,
} from "../services/trackerService.js";

export async function addUserWeight(request, h) {
  try {
    const { weight, date } = request.payload;
    const { uid } = request.auth;

    const inputDate = new Date(date);
    const today = new Date();

    const inputDateOnly = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate()
    );
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (!weight || !date) {
      return h
        .response({
          status: 400,
          message: "Please provide both weight and date",
        })
        .code(400);
    } else if (inputDateOnly > todayDateOnly) {
      return h
        .response({
          status: 400,
          message: "The date cannot be in the future",
        })
        .code(400);
    } else {
      const userRef = doc(db, "Users", uid);
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
    const { uid } = request.auth;

    const userRef = doc(db, "Users", uid);
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
