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
