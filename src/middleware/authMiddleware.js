const admin = require("firebase-admin");

const validateFirebaseIdToken = async (request, h) => {
  const authorization = request.headers.authorization;
  if (!authorization) {
    return h
      .response({ message: "Missing authorization header" })
      .code(401)
      .takeover();
  }

  const idToken = authorization.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    request.auth = { uid: decodedToken.uid };
    return h.continue;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return h.response({ message: "Invalid ID token" }).code(401).takeover();
  }
};

module.exports = { validateFirebaseIdToken };
