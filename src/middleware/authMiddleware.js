import admin from "firebase-admin";

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
    if (error.code === "auth/id-token-expired") {
      return h.response({
        message: "Your session has expired. Please log in again to continue.",
      });
    }
    return h
      .response({
        message: "Invalid ID token",
      })
      .code(401)
      .takeover();
  }
};

export { validateFirebaseIdToken };
