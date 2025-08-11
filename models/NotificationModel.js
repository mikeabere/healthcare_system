import mongoose from "mongoose";


const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    message: String,
    type: String,
    isRead: String ,
  },
  { timestamps: true }
);


export default mongoose.model("User", NotificationSchema);
