import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseApp } from "../config/firebaseConfig.js";

const auth = getAuth(firebaseApp);

export async function register(request, h) {
  try {
    const { email, password } = request.payload;

    await createUserWithEmailAndPassword(auth, email, password);

    return h
      .response({
        status: 201,
        message: "Registration successful!",
      })
      .code(201);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      return h
        .response({
          status: 409,
          message: "Email already registered!",
        })
        .code(409);
    } else {
      console.log(error.message);
      return h
        .response({
          status: 500,
          message: "An error occurred during signup.",
        })
        .code(500);
    }
  }
}

export async function login(request, h) {
  const { email, password } = request.payload;
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const idToken = await user.getIdToken();

    return h
      .response({
        status: 200,
        idToken,
      })
      .code(200);
  } catch (error) {
    if (error.code === "auth/invalid-login-credentials") {
      return h
        .response({
          status: 401,
          message: "Invalid email or password.",
        })
        .code(401);
    } else {
      console.log(error.message);
      return h
        .response({
          status: 500,
          message: "An error occurred during login.",
        })
        .code(500);
    }
  }
}

export async function logout(request, h) {
  try {
    await signOut(auth);
    return h
      .response({
        status: 200,
        message: "Logout success.",
      })
      .code(200);
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        status: 500,
        message: "Logout failed. Please try again.",
      })
      .code(500);
  }
}
