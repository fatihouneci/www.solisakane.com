import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    image: { type: Schema.Types.ObjectId, ref: "File" },
    chatName: { type: String },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastTimeMessageRead: {
      type: Date,
      default: Date.now()
    },
    ongoingCall: {
      callId: mongoose.Schema.Types.ObjectId,
      chatId: mongoose.Schema.Types.ObjectId,
      callerId: mongoose.Schema.Types.ObjectId,
      cameraStatus: Boolean,
      microphoneStatus: Boolean,
      startedAt: Date,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", schema);
export default Chat;