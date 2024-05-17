const {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} = require("../controller/userController");
const { validateFirebaseIdToken } = require("../middleware/authMiddleware");

const registerUserRoutes = (server) => {
  server.route([
    {
      path: "/api/user-profile",
      method: "POST",
      handler: createUserProfile,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/user-profile",
      method: "GET",
      handler: getUserProfile,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
    {
      path: "/api/user-profile",
      method: "PUT",
      handler: updateUserProfile,
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
    },
  ]);
};

module.exports = registerUserRoutes;
