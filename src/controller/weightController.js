const firebase = require("firebase");
const { db } = require("../config/firebaseConfig");

async function addUserWeight(request, h) {
  try {
    const { weight, date } = request.payload;
    const user = firebase.auth().currentUser;

    if (!user) {
      return h.response({
        message: "You must be logged in to add weight data",
      });
    } else if (!weight || !date) {
      return h.response({
        message: "Please provide both weight and date",
      });
    } else {
      const userRef = db.collection("Users").doc(user.uid);
      const weightHistoryQuery = userRef
        .collection("WeightHistories")
        .where("date", "==", date);
      const snapshot = await weightHistoryQuery.get();

      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        await existingDoc.ref.update({ weight: weight });
      } else {
        const weightHistoryRef = userRef.collection("WeightHistories");
        await weightHistoryRef.add({
          date: date,
          weight: weight,
        });
      }
      await userRef.update({ currentWeight: weight });
      return h
        .response({
          status: "success",
          message: "Weight data added successfully.",
        })
        .code(200);
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        message:
          "An error occurred while updating your weight. Please try again later.",
      })
      .code(500);
  }
}
async function getAllUserWeightHistories(request, h) {
  try {
    const user = firebase.auth().currentUser;

    if (!user) {
      return h
        .response({
          message: "You must be logged in to access weight history.",
        })
        .code(401);
    } else {
      const userRef = db.collection("Users").doc(user.uid);
      const weightHistoryRef = userRef.collection("WeightHistories");
      const snapshot = await weightHistoryRef.get();

      const weightHistoryData = [];

      for (const doc of snapshot.docs) {
        weightHistoryData.push(doc.data());
      }

      return h.response({
        status: "success",
        message:
          weightHistoryData.length === 0
            ? "No Weight histories found"
            : `${weightHistoryData.length} weight histories found for your profile.`,
        data: weightHistoryData,
      });
    }
  } catch (error) {
    console.log(error.message);
    return h
      .response({
        message:
          "An error occurred while retrieving weight history. Please try again later.",
      })
      .code(500);
  }
}

module.exports = {
  addUserWeight,
  getAllUserWeightHistories,
};
