const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp({
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
});

const COLLECTION_MAPPING = {
  "admin": "admins",
  "business": "business_users",
  "courier": "couriers",
  "client": "consumers",
};

exports.sendPushNotification = functions.firestore.
    document("push_notifications/{notificationId}").
    onCreate(async (snapshot, context) => {
      const notificationData = snapshot.data();

      if (notificationData.send) {
        console.log("Notification has already been sent.");
        return null;
      }

      const userUuid = notificationData.user_uuid;
      const userType = notificationData.user_type;

      let collectionName = COLLECTION_MAPPING[userType];
      if (!collectionName) {
        console.log(`Invalid user_type: ${userType}.`);
        return null;
      }

      const db = admin.firestore();
      if(userType == "business")
        collectionName = notificationData.order_type + 's';
      const userDocRef = db.collection(collectionName).doc(userUuid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        console.log(`User ${userUuid} not found 
            in ${collectionName} collection.`);
        return null;
      }

      const userData = userDoc.data();
      const notificationToken = userData.firebase_token;

      if (!notificationToken) {
        console.log("User does not have a notification token.");
        return null;
      }

      console.log("Sending push notification.");

      const data = notificationData.data || {};
      const notification = {
        title: notificationData.title,
        body: notificationData.message,
      };

      const message = {
        token: notificationToken,
        notification: notification,
        data: data,
      };

      const response = await admin.messaging().send(message);

      if (response) {
        await snapshot.ref.update({
          send: true,
          send_at: admin.firestore.FieldValue.serverTimestamp(),
          token: notificationToken
        });
        console.log("Push notification sent successfully.");
      } else {
        console.log("Failed to send push notification.");
      }

      return null;
    });
