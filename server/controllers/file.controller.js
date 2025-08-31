import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";

import File from "../models/file.model.js";

dotenv.config();

const maxSize = 100 * 1024 * 1024; // 10MB

const updloadImageList = CatchAsyncError(async (req, res) => {
  let data = [];
  try {
    if (req.files) {
      console.log(req.files);
      for (let i = 0; i < req.files.length; i++) {
        const file = new File();
        file.data = req.files[i];
        file.user = req.user._id;
        file.name = req.files[i].filename;
        const response = await file.save();
        data.push(response);
      }
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

const updloadSingleImage = CatchAsyncError(async (req, res, next) => {
  try {
    const file = new File();
    if (req.file.filename) {
      file.data = req.file;
      file.user = req.auth._id;
      file.name = req.file.filename;
    }
    const response = await file.save();
    return res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.log(error);
    return next(new Errors(error.message, 400));
  }
});

// // Image config
const imageMsgFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.IMAGE_PATH}`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Image config
const otherFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.FILE_PATH}`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Audio config
const audioMsgFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.AUDIO_PATH}`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".mp3");
  },
});

const AudioConfig = multer({
  storage: audioMsgFileStorage,
  limits: { fileSize: 5000 * 1024 * 1024 },
}).single("track");

const singleImageConfig = multer({
  storage: imageMsgFileStorage,
  limits: { fileSize: 100000000 },
}).single("image");

const ImageListConfig = multer({
  storage: imageMsgFileStorage,
  limits: { fileSize: 1000000 },
}).array("images");

const OtherConfig = multer({
  storage: otherFileStorage,
  limits: { fileSize: maxSize },
}).single("file");

export default {
  singleImageConfig,
  ImageListConfig,
  AudioConfig,
  OtherConfig,
  updloadSingleImage,
  updloadImageList,
};
