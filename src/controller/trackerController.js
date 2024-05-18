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

const auth = getAuth(firebaseApp);

export async function addUserWeight(request, h) {
  try {
    const { weight, date } = request.payload;
    const user = auth.currentUser;

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
    } else {
      const userRef = doc(db, "Users", user.uid);
      const weightHistoryRef = collection(userRef, "WeightHistories");
      const weightHistoryQuery = query(
        weightHistoryRef,
        where("date", "==", date)
      );
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
      await updateDoc(userRef, { currentWeight: weight });
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
      const weightHistoryRef = collection(userRef, "WeightHistories");
      const snapshot = await getDocs(weightHistoryRef);

      const weightHistoryData = [];

      for (const doc of snapshot.docs) {
        weightHistoryData.push(doc.data());
      }

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
