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

export async function createWorkoutPlanService(userRef, data) {
  const workoutPlanRef = collection(userRef, "WorkoutPlans");
  const workoutPlanQuery = query(workoutPlanRef);
  const snapshot = await getDocs(workoutPlanQuery);

  return await addDoc(workoutPlanRef, data);
}

export async function getAllUserWorkoutPlanService(userRef) {
  try {
    const workoutPlanRef = collection(userRef, "WorkoutPlans");
    const workoutPlansSnapshot = await getDocs(workoutPlanRef);
    const workoutPlans = [];

    for (const docSnapshot of workoutPlansSnapshot.docs) {
      const workoutPlanData = docSnapshot.data();
      const resolvedWorkouts = await resolveWorkouts(workoutPlanData.workouts);

      workoutPlans.push({
        id: docSnapshot.id,
        days: workoutPlanData.days,
        level: workoutPlanData.level,
        option: workoutPlanData.option,
        target: workoutPlanData.target,
        workouts: resolvedWorkouts,
      });
    }

    return workoutPlans;
  } catch (error) {
    console.error("Error fetching user workout plans:", error);
    throw error;
  }
}

export async function getUserWorkoutPlanByIdService(userRef, workoutPlanId) {
  try {
    const workoutPlanDocRef = doc(userRef, "WorkoutPlans", workoutPlanId);
    const workoutPlanDocSnapshot = await getDoc(workoutPlanDocRef);

    if (!workoutPlanDocSnapshot.exists()) {
      throw new Error("Workout plan does not exist");
    }

    const workoutPlanData = workoutPlanDocSnapshot.data();
    const resolvedWorkouts = await resolveWorkouts(workoutPlanData.workouts);

    const resolvedWorkoutPlan = {
      id: workoutPlanDocSnapshot.id,
      days: workoutPlanData.days,
      level: workoutPlanData.level,
      option: workoutPlanData.option,
      target: workoutPlanData.target,
      workouts: resolvedWorkouts,
    };

    return resolvedWorkoutPlan;
  } catch (error) {
    console.error("Error fetching user workout plan by ID:", error);
    throw error;
  }
}

export async function updateUserWorkoutPlanService(
  userRef,
  workoutPlanId,
  data
) {
  try {
    const workoutPlanDocRef = doc(userRef, "WorkoutPlans", workoutPlanId);
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
    const workoutPlanDocRef = doc(userRef, "WorkoutPlans", workoutPlanId);
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

export async function fetchWorkoutsByGroupAndOptionService(bodyGroup, option) {
  try {
    const workoutsQuery = query(
      collection(db, "Workouts"),
      where("body_group", "==", bodyGroup),
      where("option", "==", option)
    );
    const workoutsSnapshot = await getDocs(workoutsQuery);
    const workoutRefs = workoutsSnapshot.docs.map((doc) => doc.ref);
    const resolvedWorkouts = await resolveWorkouts(workoutRefs);

    return resolvedWorkouts;
  } catch (error) {
    console.error("Error fetching workouts by group and option:", error);
    throw error;
  }
}

export async function getWorkoutPlanByTargetAndOption(userRef, target, option) {
  try {
    const workoutPlansRef = collection(userRef, "WorkoutPlans");

    const querySnapshot = await getDocs(
      query(
        workoutPlansRef,
        where("target", "==", target),
        where("option", "==", option)
      )
    );

    if (querySnapshot.empty) {
      return null;
    } else {
      const workoutPlanDoc = querySnapshot.docs[0];
      const workoutPlanId = workoutPlanDoc.id;
      const workoutPlanData = workoutPlanDoc.data();

      const resolvedWorkouts = await resolveWorkouts(workoutPlanData.workouts);

      return {
        id: workoutPlanId,
        days: workoutPlanData.days,
        workouts: resolvedWorkouts,
      };
    }
  } catch (error) {
    console.error("Error fetching workout plan ID:", error);
    throw error;
  }
}

async function resolveWorkouts(workoutRefs) {
  const workoutDocs = await Promise.all(workoutRefs.map((ref) => getDoc(ref)));

  const resolvedWorkouts = await Promise.all(
    workoutDocs.map(async (workoutDoc) => {
      if (workoutDoc.exists()) {
        const workoutData = workoutDoc.data();

        // Fetch exercise images in parallel
        const exerciseImagesRef = collection(workoutDoc.ref, "exerciseImages");
        const exerciseImagesSnapshot = await getDocs(exerciseImagesRef);
        const exerciseImages = exerciseImagesSnapshot.docs.map(
          (doc) => doc.data().url
        );

        return {
          id: workoutDoc.id,
          ...workoutData,
          exerciseImages,
        };
      } else {
        return {
          id: workoutDoc.id,
          error: "Document does not exist",
        };
      }
    })
  );

  return resolvedWorkouts;
}

export async function fetchWorkoutsByName(workoutNames, option) {
  try {
    const workoutsRefs = [];

    await Promise.all(
      workoutNames.map(async (workoutName) => {
        const workoutQuery = query(
          collection(db, "Workouts"),
          where("exercise_name", "==", workoutName),
          where("option", "==", option)
        );
        const workoutsSnapshot = await getDocs(workoutQuery);

        if (!workoutsSnapshot.empty) {
          const workoutRefs = workoutsSnapshot.docs.map((doc) => doc.ref);
          workoutsRefs.push(...workoutRefs);
        }
      })
    );

    const resolvedWorkouts = await resolveWorkouts(workoutsRefs);
    return resolvedWorkouts;
  } catch (error) {
    console.error("Error fetching workouts by name:", error);
    throw error;
  }
}
