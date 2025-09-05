/**
 * @file user.controller.js
 * @description
 * EN: This file contains the controller functions for user-related operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations liées aux utilisateurs.
 */
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import request from "request"; // EN: Used for making HTTP requests / FR: Utilisé pour effectuer des requêtes HTTP
import stripe from "stripe"; // EN: Stripe API client / FR: Client API Stripe

const myStripe = stripe(process.env.stripe_test_secret_key); // EN: Initialize Stripe with secret key / FR: Initialiser Stripe avec la clé secrète

/**
 * EN: Creates a new user.
 * FR: Crée un nouvel utilisateur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const create = async (req, res) => {
  try {
    const user = new User(req.body);
    const response = await user.save();
    return res.status(200).json({
      success: true,
      message: "Successfully signed up!",
      data: response,
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
};

/**
 * EN: Middleware to load user by ID and append to req.profile.
 * FR: Middleware pour charger l'utilisateur par ID et l'ajouter à req.profile.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 * @param {string} id - The user ID. / L'ID de l'utilisateur.
 */
const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id);
    if (!user) return next(Errors("User not found", 400));
    req.profile = user;
    next();
  } catch (error) {
    next(new Errors(error.message, 400));
  }
};

/**
 * EN: Reads a user's profile.
 * FR: Lit le profil d'un utilisateur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 */
const read = (req, res) => {
  req.profile.password = undefined; // EN: Remove password from response / FR: Supprimer le mot de passe de la réponse
  return res.status(201).json({ success: true, data: req.profile });
};

/**
 * EN: Lists all users.
 * FR: Liste tous les utilisateurs.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const list = async (req, res, next) => {
  try {
    const query = {
      _id: { $ne: req.auth._id }, // EN: Exclude current user / FR: Exclure l'utilisateur actuel
    };

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.size) || 50;

    const count = await User.countDocuments();
    const pages = Math.ceil(count / pageSize);

    let users = await User.find(query).select(
      "profilePicture fullName email telephone createdAt"
    ).limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ firstName: 1 });

    res.status(201).json({ success: true, data: users, page, pages });
  } catch (error) {
    console.log(error);
    next(new Errors(error.message, 400));
  }
};

/**
 * EN: Searches for users based on a query.
 * FR: Recherche des utilisateurs en fonction d'une requête.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const search = async (req, res, next) => {
  try {
    const query = {
      _id: { $ne: req.auth._id }, // EN: exclude the current user / FR: exclure l'utilisateur actuel
    };

    // EN: Search by full name if search query is provided
    // FR: Rechercher par nom complet si une requête de recherche est fournie
    if (req.query.search) {
      query.fullName = { $regex: req.query.search, $options: "i" };
    }

    console.log("########req.query")
    console.log(req.query)

    // EN: Exclude user IDs passed as "exclude" (comma-separated)
    // FR: Exclure les ID d'utilisateur passés comme "exclude" (séparés par des virgules)
    if (req.query.exclude) {
      console.log(req.query.exclude)
      const excludedIds = req.query.exclude.split(",").map((id) => id.trim());
      query._id.$nin = excludedIds;
    }

    console.log(query)

    const users = await User.find(query)
      .select("profilePicture fullName email telephone createdAt")
      .limit(20);

      console.log(users)

    res.status(201).json({ success: true, data: users });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
};

/**
 * EN: Updates a user's profile.
 * FR: Met à jour le profil d'un utilisateur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const update = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.profile._id, req.body, {
      new: true,
    }).select("profilePicture firstName lastName email telephone createdAt");
    res
      .status(201)
      .json({ success: true, message: "Modification éffectuée", user });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
};

/**
 * EN: Removes a user.
 * FR: Supprime un utilisateur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 */
const remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.profile._id);
    res
      .status(201)
      .json({ success: true, message: "Utilisateur supprimé", user });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
};

/**
 * EN: Middleware to check if the user is a seller.
 * FR: Middleware pour vérifier si l'utilisateur est un vendeur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller;
  if (!isSeller) {
    return next(Errors("User is not a seller", 403));
  }
  next();
};

/**
 * EN: Handles Stripe authentication.
 * FR: Gère l'authentification Stripe.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const stripe_auth = (req, res, next) => {
  request(
    {
      url: "https://connect.stripe.com/oauth/token",
      method: "POST",
      json: true,
      body: {
        client_secret: config.stripe_test_secret_key,
        code: req.body.stripe,
        grant_type: "authorization_code",
      },
    },
    (error, response, body) => {
      // EN: Update user / FR: Mettre à jour l'utilisateur
      if (body.error) {
        return next(Errors(body.error_description, 400));
      }
      req.body.stripe_seller = body;
      next();
    }
  );
};

/**
 * EN: Handles Stripe customer creation or update.
 * FR: Gère la création ou la mise à jour d'un client Stripe.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const stripeCustomer = (req, res, next) => {
  if (req.profile.stripe_customer) {
    // EN: Update stripe customer / FR: Mettre à jour le client Stripe
    myStripe.customers.update(
      req.profile.stripe_customer,
      {
        source: req.body.token,
      },
      (error, customer) => {
        if (error) {
          return next(Errors("Could not update charge details", 400));
        }
        req.body.order.payment_id = customer.id;
        next();
      }
    );
  } else {
    myStripe.customers
      .create({
        email: req.profile.email,
        source: req.body.token,
      })
      .then((customer) => {
        User.update(
          { _id: req.profile._id },
          { $set: { stripe_customer: customer.id } },
          (error, order) => {
            if (error) {
              return next(Errors(error.message, 400));
            }
            req.body.order.payment_id = customer.id;
            next();
          }
        );
      });
  }
};

/**
 * EN: Creates a Stripe charge.
 * FR: Crée un paiement Stripe.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const createCharge = (req, res, next) => {
  if (!req.profile.stripe_seller) {
    return next(Errors("Please connect your Stripe account", 400));
  }
  myStripe.tokens
    .create(
      {
        customer: req.order.payment_id,
      },
      {
        stripeAccount: req.profile.stripe_seller.stripe_user_id,
      }
    )
    .then((token) => {
      myStripe.charges
        .create(
          {
            amount: req.body.amount * 100, // EN: amount in cents / FR: montant en cents
            currency: "usd",
            source: token.id,
          },
          {
            stripeAccount: req.profile.stripe_seller.stripe_user_id,
          }
        )
        .then((charge) => {
          next();
        });
    });
};

export default {
  create,
  userByID,
  read,
  list,
  search,
  remove,
  update,
  isSeller,
  stripe_auth,
  stripeCustomer,
  createCharge,
};