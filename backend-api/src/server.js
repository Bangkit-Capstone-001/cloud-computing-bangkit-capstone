import Hapi from '@hapi/hapi';
import registerAuthRoutes from './routes/authRoute.js';
import registerUserRoutes from './routes/userRoute.js';
import registerTrackerRoutes from './routes/trackerRoute.js';
import registerWorkoutRoutes from './routes/workoutRoute.js';
import admin from 'firebase-admin';
import config from './config/config.js';
import registerDietPlanRoutes from './routes/dietPlanRoutes.js';
import registerFoodAnalysisRoutes from './routes/foodAnalysisRoute.js';

(async () => {
	const server = Hapi.server({
		port: config.port,
		host: config.host,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	registerAuthRoutes(server);
	registerUserRoutes(server);
	registerTrackerRoutes(server);
	registerDietPlanRoutes(server);
	registerWorkoutRoutes(server);
	registerFoodAnalysisRoutes(server);

	try {
		await server.start();

		console.log(`Server started at: ${server.info.uri}`);
	} catch (error) {
		console.error('Server startup error:', error);
		process.exit(1);
	}
})();
