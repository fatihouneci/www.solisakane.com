import mongoose from "mongoose";
import crypto from "crypto";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

schema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

const Invitation = mongoose.model("Invitation", schema);
export default Invitation;
