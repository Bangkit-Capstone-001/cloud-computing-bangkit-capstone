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

  weightHistoryData.sort((a, b) => new Date(a.date) - new Date(b.date));

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

  const inputDateOnly = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  );
  const closestDateOnly = new Date(
    closestExistingDate.getFullYear(),
    closestExistingDate.getMonth(),
    closestExistingDate.getDate()
  );
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const inputDateDifference = Math.abs(todayDateOnly - inputDateOnly);
  const closestDateDifference = Math.abs(todayDateOnly - closestDateOnly);

  if (inputDateDifference <= closestDateDifference) {
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const { bmi } = await bmiCalculator(userData.currentHeight, weight);
    await updateDoc(userRef, { bmi: bmi, currentWeight: weight });
  }

  return;
}

async function getClosestDateToToday(today, dates) {
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  let closestDate = null;
  let minDifference = Infinity;

  dates.forEach((date) => {
    const input = new Date(date);
    const inputDateOnly = new Date(
      input.getFullYear(),
      input.getMonth(),
      input.getDate()
    );

    const differenceInTime = Math.abs(todayDateOnly - inputDateOnly);
    if (differenceInTime < minDifference) {
      minDifference = differenceInTime;
      closestDate = inputDateOnly;
    }
  });

  return closestDate;
}

export async function bmiCalculator(currentHeight, currentWeight) {
  const heightInMeters = parseInt(currentHeight) / 100;
  const bmi = parseInt(currentWeight) / (heightInMeters * heightInMeters);

  const roundedBmi = Math.round(bmi * 100) / 100;
  return { bmi: roundedBmi };
}
