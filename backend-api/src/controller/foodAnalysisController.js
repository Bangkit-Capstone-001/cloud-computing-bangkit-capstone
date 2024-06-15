import { firebaseApp } from '../config/firebaseConfig.js';
import FormData from 'form-data';
import { db } from '../config/firebaseConfig.js';
import fetch from 'node-fetch';
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import {
	createFoodAnalysisService,
	getAllFoodsServices,
	getFoodByNameService,
	getTodayFoodByMealtime,
} from '../services/foodAnalysisService.js';
import config from '../config/config.js';

export async function createUserFoodHistory(request, h) {
	const { uid } = request.auth;

	try {
		const userRef = doc(db, 'Users', uid);
		const userSnapshot = await getDoc(userRef);

		if (!userSnapshot.exists()) {
			return h
				.response({
					status: 404,
					message: 'User profile does not exist',
				})
				.code(404);
		}
		const { foodId, quantity, mealtime } = request.payload;

		if (!foodId || !quantity || !mealtime) {
			return h
				.response({
					status: 400,
					message: 'Please provide both foodId, quantity, and mealtime',
				})
				.code(400);
		}

		const food = doc(db, 'Foods', foodId);
		const foodSnapshot = await getDoc(food);
		const foodData = foodSnapshot.data();

		if (!foodSnapshot.exists()) {
			return h
				.response({
					status: 404,
					message: 'Food does not exist',
				})
				.code(404);
		}
		// console.log(foodData);

		const created = await createFoodAnalysisService(userRef, {
			food: food,
			quantity: quantity,
			calories:
				(parseInt(foodData.komposisi_energi_kal) * quantity) /
				parseInt(foodData.komposisi_per),
			date: Date.now(),
			mealtime: mealtime,
		});

		return h
			.response({
				status: 201,
				message: 'Food intake logged successfully',
			})
			.code(201);
	} catch (error) {
		console.log(error);
		return h
			.response({
				status: 500,
				message: 'An error occurred. Please try again later.',
			})
			.code(500);
	}
}
export async function getFoodByName(request, h) {
	const { uid } = request.auth;

	try {
		const userRef = doc(db, 'Users', uid);
		const userSnapshot = await getDoc(userRef);

		if (!userSnapshot.exists()) {
			return h
				.response({
					status: 404,
					message: 'User profile does not exist',
				})
				.code(404);
		}

		const { foodName } = request.params;
		const foods = await getFoodByNameService(foodName);

		return h.response({ status: 200, data: foods }).code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({
				status: 500,
				message: 'An error occurred. Please try again later.',
			})
			.code(500);
	}
}
export async function getAllFoods(request, h) {
	const { uid } = request.auth;

	try {
		const foods = await getAllFoodsServices();
		return h.response({ status: 200, data: foods }).code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({
				status: 500,
				message: 'An error occurred. Please try again later.',
			})
			.code(500);
	}
}

export async function getRandomFoods(request, h) {
	try {
		const { randomize } = request.query;
		const foods = await getAllFoodsServices();
		const randomFoods = foods.sort(() => 0.5 - Math.random()).slice(0, randomize);
		return h
			.response({
				status: 200,
				message: `Retrieved ${randomize} random foods`,
				data: randomFoods,
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({
				status: 500,
				message: 'An error occurred. Please try again later.',
			})
			.code(500);
	}
}

export async function getTodayFoods(request, h) {
	try {
		const { uid } = request.auth;
		const { mealtime } = request.query;
		const userRef = doc(db, 'Users', uid);

		const foods = await getTodayFoodByMealtime(userRef, mealtime);

		if (foods === null) {
			return h.response({
				status: 200,
				message: `You have not input any ${mealtime} foods for today`,
			});
		}

		return h
			.response({
				status: 200,
				message: `Retrieved ${foods.length} of ${mealtime} foods for today`,
				data: foods,
			})
			.code(200);
	} catch (error) {
		console.log(error.message);
		return h
			.response({
				status: 500,
				message: "Failed to fetch user's today foods",
			})
			.code(500);
	}
}

export async function getFoodByPicture(request, h) {
	const { uid } = request.auth;

	try {
		const userRef = doc(db, 'Users', uid);
		const userSnapshot = await getDoc(userRef);

		if (!userSnapshot.exists()) {
			return h
				.response({
					status: 404,
					message: 'User profile does not exist',
				})
				.code(404);
		}

		const { image } = request.payload;

		if (!image) {
			return h.response({ status: 400, message: 'Image is required' }).code(400);
		}

		const formData = new FormData();
		formData.append('image', image._data, {
			filename: image.hapi.filename,
			contentType: image.hapi.headers['content-type'],
		});
		const response = await fetch(`${config.mlApiUrl}/food/predict`, {
			method: 'POST',
			body: formData,
			headers: formData.getHeaders(),
		});

		if (!response.ok) {
			throw new Error(`External API error: ${response.statusText}`);
		}

		const result = await response.json();
		if (!result.food || result.confidence < 85) {
			return h
				.response({
					status: 400,
					message: 'Image not recognized as food, please try again with another image.',
				})
				.code(400);
		}

		const foods = await getFoodByNameService(result.food);

		return h
			.response({
				status: 200,
				message: `Your image is predicted as ${result.food}`,
				data: foods,
			})
			.code(200);
	} catch (error) {
		console.log(error);
		return h
			.response({
				status: 500,
				message: 'An error occurred. Please try again later.',
			})
			.code(500);
	}
}
