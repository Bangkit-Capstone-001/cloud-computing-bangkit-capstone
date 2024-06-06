import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig.js";

export async function createFoodAnalysisService(userRef, data) {
  const foodAnalysisRef = collection(userRef, "FoodAnalysis");
  const foodAnalysisQuery = query(foodAnalysisRef);
  const snapshot = await getDocs(foodAnalysisQuery);

  const docRef = await addDoc(foodAnalysisRef, data);
  return docRef;
}

export async function getFoodAnalysisByIdService(userRef, foodId) {
  const foodAnalysisRef = collection(userRef, "FoodAnalysis");
  const foodAnalysisQuery = query(
    foodAnalysisRef,
    where("foodId", "==", foodId)
  );
  const snapshot = await getDocs(foodAnalysisQuery);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

export async function getFoodByNameService(foodName) {
  const foodRef = collection(db, "Foods");
  const foodQuery = query(foodRef);
  const snapshot = await getDocs(foodQuery);

  if (snapshot.empty) {
    return null;
  }

  const foods = snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, ...data };
  });

  const words = foodName.toLowerCase().split(" ");

  const filteredFoods = foods.filter((food) => {
    const foodNameLowerCase = food.nama_bahan_makanan.toLowerCase();
    return words.every((word) => foodNameLowerCase.includes(word));
  });

  return filteredFoods;
}
