import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
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

export async function getFoodIntakeToday(userRef) {
  const foodAnalysisRef = collection(userRef, "FoodAnalysis");

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime();
  const endOfDay = new Date(now.setHours(23, 59, 59, 999)).getTime();

  const foodAnalysisQuery = query(
    foodAnalysisRef,
    where("date", ">=", startOfDay),
    where("date", "<=", endOfDay)
  );

  const snapshot = await getDocs(foodAnalysisQuery);
  if (snapshot.empty) {
    return null;
  }

  const foodAnalysis = snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, ...data };
  });

  return foodAnalysis;
}

export async function getAllFoodsServices() {
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

  return foods;
}

export async function getTodayFoodByMealtime(userRef, mealtime) {
  try {
    // Getting today's date at midnight as a numeric timestamp
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Getting tomorrow's date at midnight as a numeric timestamp
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowTimestamp = tomorrow.getTime();

    const foodAnalysisRef = collection(userRef, "FoodAnalysis");

    const q = query(
      foodAnalysisRef,
      where("mealtime", "==", mealtime),
      where("date", ">=", todayTimestamp),
      where("date", "<", tomorrowTimestamp)
    );

    const querySnapshot = await getDocs(q);

    const foodsPromises = querySnapshot.docs.map(async (doc) => {
      const foodRef = doc.data().food;
      const foodDoc = await getDoc(foodRef);
      if (foodDoc.exists()) {
        const foodData = foodDoc.data();
        return {
          food: {
            id: foodDoc.id,
            nama_bahan_makanan: foodData.nama_bahan_makanan,
            komposisi_karbohidrat_g: foodData.komposisi_karbohidrat_g,
            komposisi_lemak_g: foodData.komposisi_lemak_g,
            komposisi_energi_kal: foodData.komposisi_energi_kal,
            komposisi_protein_g: foodData.komposisi_protein_g,
            komposisi_per: foodData.komposisi_per,
          },
          mealtime: doc.data().mealtime,
          calories: doc.data().calories,
          quantity: doc.data().quantity,
          date: doc.data().date,
        };
      }
      return null;
    });

    const foods = await Promise.all(foodsPromises);

    return foods.filter((food) => food !== null);
  } catch (error) {
    console.error("Error fetching today's food by mealtime:", error);
    throw error;
  }
}
