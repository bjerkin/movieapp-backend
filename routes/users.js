const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("./../models/user");

//Added for testing purposes
router.get("/", (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(users);
    }
  });
});

router.post("/", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10)
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    favourites: [],
  });

  try {
    await user.save();
    res.status(201).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/login", async (req, res) => {
  const user = user.find((user) => user.name === req.body.name);
  if (!user) return res.status(400).send("User not found");

  try {
    if (bcrypt.compare(req.body.password, user.password)) {
      res.send("Logged in");
    } else {
      res.status(400).send("Not Allowed");
    }
  } catch (err){
    res.status(500).send(err);
  }
});

//UserID
router.get("/:id", async (req, res) => {
  console.log(req.params.id);
  const user = await User.findById(req.params.id);
  console.log(user);
});

router.patch(
  "/:id",
  async (req, res, next) => {
    req.user = await User.findById(req.params.id);
    next();
  },
  saveUser()
);

router.get("/:id/favourites", validateUserId, async (req, res) => {
  res.status(200).json(req.user.favourites);
});

router.patch("/:id/favourites", validateUserId, validateMovieId, async (req, res) => {
  let user = req.user;
  let movieId = req.body.movieId;

  if (user.favourites.includes(movieId)) {
    return res.status(400).send("Movie already in favourites");
  }

  user.favourites.push(movieId);

  try {
    await user.save();
    res.status(201).send(user.favourites);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/:id/favourites", validateUserId, validateMovieId, async (req, res) => {
  let user = req.user;
  let movieId = req.body.movieId;

  if (!user.favourites.includes(movieId)) {
    return res.status(400).send("Movie not in favourites");
  }

  user.favourites.remove(movieId);

  try {
    await user.save();
    res.status(201).send(user.favourites);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Function that validates userId, calls next function if userId is valid
async function validateUserId(req, res, next) {
  let userId = req.params.id;

  let user;
  try {
    user = await User.findById(userId);
    req.user = user;
  } catch (error) {
    return res.status(404).send("User not found");
  }

  next();
}

//Function that validates movieId, calls next function if movieId is valid
async function validateMovieId(req, res, next) {
  let movieId = req.body.movieId;
  if (!movieId) {
    return res.status(400).send("Movie ID is required");
  }

  if (typeof movieId !== "number") {
    return res.status(400).send("Movie ID must be a number");
  }

  let favourites = [];
  try {
    req.user = await User.findById(req.params.id, { favourites: 1 });
  } catch (err) {
    return res.status(500).send(err);
  }


  next();
}

function saveUser() {
  return async (req, res) => {
    let user = req.user;

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.favourites) user.favourites = req.body.favourites;

    try {
      await user.save();
      res.status(201).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  };
}

module.exports = router;
