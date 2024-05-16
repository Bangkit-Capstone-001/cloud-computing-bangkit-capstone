const firebase = require("firebase");

async function register(request, h) {
  try {
    const { email, password } = request.payload;

    await firebase.auth().createUserWithEmailAndPassword(email, password);

    return h
      .response({
        status: "success",
        message: "Registration successful!",
      })
      .code(201);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      return h
        .response({ status: "error", message: "Email already registered!" })
        .code(409);
    } else {
      console.error("Firebase error:", error);
      return h
        .response({
          status: "error",
          message: "An error occurred during signup.",
        })
        .code(500);
    }
  }
}

async function login(request, h) {
  const { email, password } = request.payload;
  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const idToken = await user.getIdToken();

    return h.response({ idToken }).code(200);
  } catch (error) {
    if (error.code === "auth/internal-error") {
      return h
        .response({
          status: "fail",
          message: "Invalid email or password.",
        })
        .code(401);
    } else {
      return h
        .response({
          status: "fail",
          message: "An error occurred during login.",
        })
        .code(500);
    }
  }
}

async function logout(request, h) {
  const user = firebase.auth().currentUser;

  try {
    if (!user) {
      return h
        .response({
          status: "info",
          message: "No user currently signed in.",
        })
        .code(200);
    } else {
      firebase.auth().signOut();
      return h
        .response({
          status: "success",
          message: "Logout success.",
        })
        .code(200);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: "fail",
        message: "Logout failed. Please try again.",
      })
      .code(500);
  }
}

module.exports = { register, login, logout };
