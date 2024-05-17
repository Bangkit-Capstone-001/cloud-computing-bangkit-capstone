const {
  addUserWeight,
  getAllUserWeightHistories,
} = require("../controller/weightController");
const { validateFirebaseIdToken } = require("../middleware/authMiddleware");

const registerTrackerRoutes = (server) => {
  server.route([
    {
      path: "/api/tracker",
      method: "POST",
      handler: addUserWeight,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/tracker",
      method: "GET",
      handler: getAllUserWeightHistories,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
};

module.exports = registerTrackerRoutes;
