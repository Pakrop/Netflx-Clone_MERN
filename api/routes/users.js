const router = require("express").Router();
const User = require("../models/User.js");
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken.js");

//update
router.put("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    try {
      const updateUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(200).json(updateUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("คุณสามารถอัปเดตบัญชีคุณเองได้เท่านั้น");
  }
});

//delete
router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      const del = await User.findByIdAndDelete(req.params.id);
      res.status(200).json(del);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("คุณสามารถลบบัญชีคุณเองได้เท่านั้น");
  }
});

//get
router.get("/find/:id", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all
router.get("/", verify, async (req, res) => {
  const query = req.query.new;
  if (req.user.isAdmin) {
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(10)
        : await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("คุณสามารถดูข้อมูลได้ทั้งหมด");
  }
});

//get user stats
router.get("/stats", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  const monthsArray = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม ",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน ",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json("err");
  }
});

module.exports = router;
