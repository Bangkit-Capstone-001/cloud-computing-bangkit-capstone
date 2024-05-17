const { register, login, logout } = require("../controller/authController");
const { validateFirebaseIdToken } = require("../middleware/authMiddleware");

const registerAuthRoutes = (server) => {
  server.route([
    {
      path: "/api/auth/register",
      method: "POST",
      handler: register,
      options: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/api/auth/login",
      handler: login,
      options: {
        auth: false,
      },
    },
    {
      path: "/api/auth/logout",
      method: "GET",
      options: {
        pre: [{ method: validateFirebaseIdToken }],
      },
      handler: logout,
    },
  ]);
};

module.exports = registerAuthRoutes;
