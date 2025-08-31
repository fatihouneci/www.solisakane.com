import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import request from "request";
import stripe from "stripe";

const myStripe = stripe(process.env.stripe_test_secret_key);

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
 * Load user and append to req.
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

const read = (req, res) => {
  req.profile.password = undefined;
  return res.status(201).json({ success: true, data: req.profile });
};

const list = async (req, res, next) => {
  try {
    const query = {
      _id: { $ne: req.auth._id },
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

const search = async (req, res, next) => {
  try {
    const query = {
      _id: { $ne: req.auth._id }, // exclude the current user
    };

    // Search by full name if search query is provided
    if (req.query.search) {
      query.fullName = { $regex: req.query.search, $options: "i" };
    }

    console.log("########req.query")
    console.log(req.query)

    // Exclude user IDs passed as "exclude" (comma-separated)
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

const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller;
  if (!isSeller) {
    return next(Errors("User is not a seller", 403));
  }
  next();
};

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
      //update user
      if (body.error) {
        return next(Errors(body.error_description, 400));
      }
      req.body.stripe_seller = body;
      next();
    }
  );
};

const stripeCustomer = (req, res, next) => {
  if (req.profile.stripe_customer) {
    //update stripe customer
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
            amount: req.body.amount * 100, //amount in cents
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
