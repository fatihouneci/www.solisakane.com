import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import Errors from "../helpers/Errors.js";
import Utility from "../helpers/Utility.js";
import sendMail from "../helpers/email.js";
import config from "../config/config.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import bcrypt from "bcryptjs";

const register = CatchAsyncError(async (req, res, next) => {
  try {
    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
      return next(new Errors("Cette adresse exist déjà", 400));
    }

    const user = new User(req.body);
    const activation = Utility.generateActivationToken(user);
    let data = { user, activationCode: activation.activationCode };
    await sendMail({
      to: user.email,
      subject: "Activation du compte.",
      template: "activation-mail.ejs",
      data,
    });
    res.status(201).json({
      success: true,
      message: `Veuillez vérifier votre e-mail : ${user.email}, Pour activer votre compte`,
      activationToken: activation.token,
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const activation = CatchAsyncError(async (req, res, next) => {

  try {
    const { activation_token, activation_code } = req.body;
    const token = Utility.verifyActivationToken(activation_token);

    if (token.activationCode !== activation_code) {
      return next(new Errors("Activation code invalide!", 400));
    }

    const isEmailExist = await User.findOne({ email: token.email });
    if (isEmailExist) {
      return next(new Errors("Cette adresse exist déjà", 400));
    }

    const { email } = token;

    let user = new User({ email });
    await user.save();

    const access_token = jwt.sign(
      {
        _id: user._id,
      },
      config.jwtSecret
    );

    res.cookie("t", access_token, {
      expire: new Date() + 9999,
    });

    res.status(200).json({
      success: true,
      user,
      token: access_token,
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const newPassword = CatchAsyncError(async (req, res, next) => {
  try {
    const isEmailExist = await User.findOne({ email: req.body.email });
    if (!isEmailExist) {
      return next(new Errors("Cet utilisateur n'existe pas", 400));
    }

    let hash_password = await bcrypt.hash(req.body.password, 8);

    const user = await User.findByIdAndUpdate(
      req.auth._id,
      {
        email: req.body.email,
        password: hash_password,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const updateProfile = CatchAsyncError(async (req, res, next) => {
  try {
    req.body.fullName = `${req.body.firstName} ${req.body.lastName}`
    const user = await User.findByIdAndUpdate(req.auth._id, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

const signin = CatchAsyncError(async (req, res, next) => {
  try {
    let user = await User.findOne({
      email: req.body.email
    });

    if (!user || user.isDeleted === true) return next(new Errors("Utilisateur introuvable !", 401));

    const isValid = await bcrypt.compare(req.body.password, user.password);

    if (!isValid) {
      return next(
        new Errors("L'e-mail et le mot de passe ne correspondent pas.", 401)
      );
    }

    const access_token = jwt.sign(
      {
        _id: user._id,
      },
      config.jwtSecret
    );

    res.cookie("t", access_token, {
      expire: new Date() + 9999,
    });

    return res.status(201).json({
      success: true,
      token: access_token,
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const signout = CatchAsyncError(async (req, res, next) => {
  res.clearCookie("t");
  return res.status("200").json({
    success: true,
    message: "signed out",
  });
});

const removeAccount = CatchAsyncError(async (req, res, next) => {
  const userId = req.auth._id;

  await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });

  res.clearCookie("t");
  return res.status(200).json({
    success: true,
    message: "user deleted",
  });
});

const forgotPassword = CatchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new Errors("aucun utilisateur trouvé", 400));
    }

    user.resetToken = {
      token: Math.floor(1000 + Math.random() * 9000).toString(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Changer de mot de passe.",
      template: "password-reset-mail.ejs",
      data: { user },
    });

    res.status(200).send({
      success: true,
      message:
        "Veuillez vérifier votre adresse électronique pour les instructions de réinitialisation du mot de passe",
    });
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

const verifyAccount = CatchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findOne({
      "resetToken.token": req.body.activation_code,
      "resetToken.expires": { $gt: Date.now() },
    });

    if (!user) {
      return next(new Errors("aucun utilisateur trouvé", 400));
    }

    user.resetToken = undefined;
    await user.save();
    res.status(200).send({
      success: true,
      user,
      message: "Vérification du mot de passe réussie",
    });
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

const resetPassword = CatchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    if (!user) {
      return next(new Errors("aucun utilisateur trouvé", 400));
    }

    // update password
    user.password = await bcrypt.hash(req.body.password, 8);
    await user.save();
    res.status(200).send({
      success: true,
      message:
        "Réinitialisation du mot de passe réussie, vous pouvez maintenant vous connecter",
    });
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

const requireSignin = expressjwt({
  secret: config.jwtSecret,
  userProperty: "auth",
  algorithms: ["HS256"],
});

const hasAuthorization = CatchAsyncError(async (req, res, next) => {
  // const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
  const authorized = true;
  if (!authorized) {
    return next(new Errors("User is not authorized", 403));
  }
  next();
});

const profile = CatchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id);
    res.status(200).send({
      success: true,
      message: "Profile utilisateur",
      user,
    });
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

const updateToken = CatchAsyncError(async (req, res, next) => {
  try {
    try {
      const user = await User.findByIdAndUpdate(req.auth._id, req.body, {
        new: true,
      });
      res.status(200).send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

export default {
  register,
  activation,
  newPassword,
  updateProfile,
  signin,
  signout,
  removeAccount,
  verifyAccount,
  resetPassword,
  forgotPassword,
  requireSignin,
  hasAuthorization,
  profile,
  updateToken,
};
