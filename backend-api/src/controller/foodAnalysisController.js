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
  createFoodAnalysisService,
  getAllFoodsServices,
  getFoodByNameService,
} from "../services/foodAnalysisService.js";

export async function createUserFoodHistory(request, h) {
  const { uid } = request.auth;

  try {
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
    const { foodId, quantity } = request.payload;

    if (!foodId || !quantity) {
      return h
        .response({
          status: 400,
          message: "Please provide both foodId and quantity",
        })
        .code(400);
    }

    const food = doc(db, "Foods", foodId);
    const foodSnapshot = await getDoc(food);
    const foodData = foodSnapshot.data();

    if (!foodSnapshot.exists()) {
      return h
        .response({
          status: 404,
          message: "Food does not exist",
        })
        .code(404);
    }

    const created = await createFoodAnalysisService(userRef, {
      food: food,
      quantity: quantity,
      calories: (parseInt(foodData.komposisi_energi_kal) * quantity) / 100,
      date: Date.now(),
    });

    return h
      .response({
        status: 201,
        message: "Food intake logged successfully",
      })
      .code(201);
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
export async function getFoodByName(request, h) {
  const { uid } = request.auth;

  try {
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

    const { foodName } = request.params;
    const foods = await getFoodByNameService(foodName);

    return h.response({ status: 200, data: foods }).code(200);
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
export async function getAllFoods(request, h) {
  const { uid } = request.auth;

  try {
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

    const foods = await getAllFoodsServices();
    return h.response({ status: 200, data: foods }).code(200);
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
