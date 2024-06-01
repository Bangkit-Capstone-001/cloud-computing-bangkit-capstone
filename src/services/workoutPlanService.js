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
  updateDoc,
} from "firebase/firestore";

export async function createWorkoutPlanService(userRef, data) {
  const workoutPlanRef = collection(userRef, "WorkoutPlan");
  const workoutPlanQuery = query(workoutPlanRef);
  const snapshot = await getDocs(workoutPlanQuery);

  return await addDoc(workoutPlanRef, data);
}

export async function getAllUserWorkoutPlanService(userRef) {
  const workoutPlanRef = collection(userRef, "WorkoutPlan");
  const workoutPlansSnapshot = await getDocs(workoutPlanRef);
  const workoutPlans = [];

  for (const docSnapshot of workoutPlansSnapshot.docs) {
    const workoutPlanData = docSnapshot.data();
    const resolvedWorkouts = [];

    // Resolve each workout reference
    for (const workoutRef of workoutPlanData.workouts) {
      const workoutDoc = await getDoc(workoutRef);
      if (workoutDoc.exists()) {
        resolvedWorkouts.push({ id: workoutDoc.id, ...workoutDoc.data() });
      } else {
        resolvedWorkouts.push({
          id: workoutRef.id,
          error: "Document does not exist",
        });
      }
    }

    workoutPlans.push({
      id: docSnapshot.id,
      days: workoutPlanData.days,
      workouts: resolvedWorkouts,
    });
  }

  console.log(workoutPlans); // To verify the data
  return workoutPlans;
}

export async function getUserWorkoutPlanByIdService(userRef, workoutPlanId) {
  try {
    const workoutPlanDocRef = doc(userRef, "WorkoutPlan", workoutPlanId);
    const workoutPlanDocSnapshot = await getDoc(workoutPlanDocRef);

    if (!workoutPlanDocSnapshot.exists()) {
      throw new Error("Workout plan does not exist");
    }

    const workoutPlanData = workoutPlanDocSnapshot.data();
    const resolvedWorkouts = [];

    for (const workoutRef of workoutPlanData.workouts) {
      const workoutDoc = await getDoc(workoutRef);
      if (workoutDoc.exists()) {
        resolvedWorkouts.push({ id: workoutDoc.id, ...workoutDoc.data() });
      } else {
        resolvedWorkouts.push({
          id: workoutRef.id,
          error: "Document does not exist",
        });
      }
    }

    const resolvedWorkoutPlan = {
      id: workoutPlanDocSnapshot.id,
      days: workoutPlanData.days,
      workouts: resolvedWorkouts,
    };

    console.log(resolvedWorkoutPlan); // To verify the data
    return resolvedWorkoutPlan;
  } catch (error) {
    throw error;
  }
}

export async function updateUserWorkoutPlanService(
  userRef,
  workoutPlanId,
  data
) {
  try {
    const workoutPlanDocRef = doc(userRef, "WorkoutPlan", workoutPlanId);
    const workoutPlanDocSnapshot = await getDoc(workoutPlanDocRef);

    if (!workoutPlanDocSnapshot.exists()) {
      throw new Error("Workout plan does not exist");
    }
    await updateDoc(workoutPlanDocRef, data);
    return true;
  } catch (error) {
    throw error;
  }
}

export async function deleteUserWorkoutPlanService(userRef, workoutPlanId) {
  try {
    const workoutPlanDocRef = doc(userRef, "WorkoutPlan", workoutPlanId);
    const workoutPlanDocSnapshot = await getDoc(workoutPlanDocRef);

    if (!workoutPlanDocSnapshot.exists()) {
      throw new Error("Workout plan does not exist");
    }
    await deleteDoc(workoutPlanDocRef);
    return true;
  } catch (error) {
    throw error;
  }
}
