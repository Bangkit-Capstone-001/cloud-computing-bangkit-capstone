import { validateFirebaseIdToken } from '../middleware/authMiddleware.js';
import {
	getRandomWorkout,
	getAllWorkoutByTargetAndOption,
	createWorkoutPlan,
	getAllUserWorkoutPlan,
	getUserWorkoutPlanById,
	updateUserWorkoutPlan,
	deleteUserWorkoutPlan,
	getWorkoutRecommendations,
	changeWorkoutPlanCompleteStatus,
} from '../controller/workoutController.js';

export default function registerWorkoutRoutes(server) {
	server.route([
		{
			path: '/api/workout/random',
			method: 'GET',
			handler: getRandomWorkout,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout',
			method: 'GET',
			handler: getAllWorkoutByTargetAndOption,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout/plan',
			method: 'POST',
			handler: createWorkoutPlan,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout/plan',
			method: 'GET',
			handler: getAllUserWorkoutPlan,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout/plan/{planId}',
			method: 'GET',
			handler: getUserWorkoutPlanById,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout/plan/{planId}/complete',
			method: 'PUT',
			handler: changeWorkoutPlanCompleteStatus,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout/plan/{planId}',
			method: 'PUT',
			handler: updateUserWorkoutPlan,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout/plan/{planId}',
			method: 'DELETE',
			handler: deleteUserWorkoutPlan,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
		{
			path: '/api/workout/recommendations',
			method: 'GET',
			handler: getWorkoutRecommendations,
			options: {
				pre: [{ method: validateFirebaseIdToken }],
			},
		},
	]);
}
