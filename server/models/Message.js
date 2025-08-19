import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  conversationId: String,
  senderId: String,
  text: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model("Message", messageSchema);
