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
