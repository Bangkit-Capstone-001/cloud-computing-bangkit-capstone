import { db } from "../config/firebaseConfig.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  updateDoc,
} from "firebase/firestore";

export async function getAllUserWeightHistoriesService(userRef) {
  const weightHistoryRef = collection(userRef, "WeightHistories");
  const snapshot = await getDocs(weightHistoryRef);

  const weightHistoryData = [];

  for (const doc of snapshot.docs) {
    weightHistoryData.push(doc.data());
  }

  return weightHistoryData;
}

export async function addUserWeightService(userRef, weight, date, today) {
  const weightHistoryRef = collection(userRef, "WeightHistories");
  const weightHistoryQuery = query(weightHistoryRef, where("date", "==", date));
  const snapshot = await getDocs(weightHistoryQuery);

  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    await updateDoc(existingDoc.ref, { weight });
  } else {
    await addDoc(weightHistoryRef, {
      date,
      weight,
    });
  }

  const allWeightHistoriesSnapshot = await getDocs(weightHistoryRef);
  const allDates = allWeightHistoriesSnapshot.docs.map(
    (doc) => doc.data().date
  );

  const inputDate = new Date(date);
  const closestExistingDate = await getClosestDateToToday(today, allDates);

  const inputDateDifference = Math.abs(today - inputDate);
  const closestDateDifference = Math.abs(today - new Date(closestExistingDate));

  if (inputDateDifference <= closestDateDifference) {
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const { bmi } = await bmiCalculator(userData.currentHeight, weight);
    await updateDoc(userRef, { bmi: bmi, currentWeight: weight });
  }

  return;
}

async function getClosestDateToToday(today, dates) {
  let closestDate = null;
  let minDifference = Infinity;

  dates.forEach((date) => {
    const input = new Date(date);
    const differenceInTime = Math.abs(today - input);
    if (differenceInTime < minDifference) {
      minDifference = differenceInTime;
      closestDate = input;
    }
  });

  return closestDate;
}

export async function bmiCalculator(currentHeight, currentWeight) {
  const heightInMeters = currentHeight / 100;
  const bmi = currentWeight / (heightInMeters * heightInMeters);

  const roundedBmi = Math.round(bmi * 100) / 100;

  return { bmi: roundedBmi };
}
