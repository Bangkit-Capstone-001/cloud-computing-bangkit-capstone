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
import { getFoodIntakeToday } from "./foodAnalysisService.js";

export async function createDietPlanService(userRef, data) {
  const dietPlanRef = collection(userRef, "DietPlan");
  const dietPlanQuery = query(dietPlanRef);
  const snapshot = await getDocs(dietPlanQuery);

  if (!snapshot.empty) {
    // If the user already has a diet plan
    await updateDoc(snapshot.docs[0].ref, data);
  } else {
    // If user doesn't have a diet plan, create a new one
    await addDoc(dietPlanRef, data);
  }
}

export async function getDietPlanService(userRef) {
  const dietPlanRef = collection(userRef, "DietPlan");
  const dietPlanQuery = query(dietPlanRef);
  const snapshot = await getDocs(dietPlanQuery);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

export async function getTodayTotalCalories(userRef) {
  const intake = await getFoodIntakeToday(userRef);
  if (!intake) {
    return 0;
  }
  return intake.reduce((acc, curr) => acc + curr.calories, 0);
}
