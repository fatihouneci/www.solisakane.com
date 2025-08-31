import express from "express";
import dotenv from "dotenv";

import authCtrl from "../controllers/auth.controller.js";
import fileController from "../controllers/file.controller.js";

dotenv.config();

const router = express.Router();

// Always accepts single image
router.post(
  "/upload-image",
  authCtrl.requireSignin,
  fileController.singleImageConfig,
  fileController.updloadSingleImage
);

// Always accepts list of image
router.post(
  "/upload-image-list",
  authCtrl.requireSignin,
  fileController.ImageListConfig,
  fileController.updloadImageList
);

export default router;
