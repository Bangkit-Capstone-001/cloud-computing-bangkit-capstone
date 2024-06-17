import { db } from '../config/firebaseConfig.js';
import { addDoc, collection, getDocs, query, updateDoc } from 'firebase/firestore';
import { getFoodIntakeToday } from './foodAnalysisService.js';

export async function createOrUpdateDietPlanService(userRef, data) {
	const dietPlanRef = collection(userRef, 'DietPlan');
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
	const dietPlanRef = collection(userRef, 'DietPlan');
	const dietPlanQuery = query(dietPlanRef);
	const snapshot = await getDocs(dietPlanQuery);

	if (snapshot.empty) {
		return null;
	}

	return snapshot.docs[0].data();
}

export async function getTodayTotalIntake(userRef) {
	const intake = await getFoodIntakeToday(userRef);
	if (!intake) {
		return {
			calories: 0,
			karbohidrat: 0,
			protein: 0,
			lemak: 0,
		};
	}

	return {
		calories: intake.reduce((acc, curr) => acc + curr.calories, 0),
		karbohidrat: intake.reduce((acc, curr) => acc + curr.karbohidrat, 0),
		protein: intake.reduce((acc, curr) => acc + curr.protein, 0),
		lemak: intake.reduce((acc, curr) => acc + curr.lemak, 0),
	};
}
