const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp({
  apiKey: "AIzaSyDGE62OVLm4tBqmBOeWvXAA6L_7XxLEm4A",
  authDomain: "point-citi.firebaseapp.com",
  databaseURL: "https://point-citi-default-rtdb.firebaseio.com",
  projectId: "point-citi",
  storageBucket: "point-citi.appspot.com",
  messagingSenderId: "593532867918",
  appId: "1:593532867918:web:7975ecd086e0890457ba1f",
  measurementId: "G-XRLEG2M9PV",
});


exports.sendNewOrderNotification = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snapshot, context) => {
        const newOrderData = snapshot.data();
        
        const consumerId = newOrderData.consumerId;
            
        if (!consumerId) {
            console.log("there is no user id...");
            return null;
        }

        const newNotificationData = {
            created_at: new Date(),
            data: null,
            message: "This is test",
            read: false,
            send: false,
            send_at: null,
            title: "New message from admin",
            user_type: "client",
            user_uuid: consumerId,
        };
        try {
            const newNotificationRef = admin.firestore().
                collection("push_notifications").doc();
            await newNotificationRef.set(newNotificationData);
            const newNotificationRef1 = admin.firestore().
                collection("test_notification").doc();
            await newNotificationRef1.set(newNotificationData);
        } catch (error) {
            console.log("there is a error", error);
        }
    });
