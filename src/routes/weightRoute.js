const {
  addUserWeight,
  getAllUserWeightHistories,
} = require("../controller/weightController");
const { validateFirebaseIdToken } = require("../middleware/authMiddleware");

const registerWeightRoutes = (server) => {
  server.route([
    {
      path: "/weight",
      method: "POST",
      handler: addUserWeight,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/weight-all",
      method: "GET",
      handler: getAllUserWeightHistories,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
};

module.exports = registerWeightRoutes;
