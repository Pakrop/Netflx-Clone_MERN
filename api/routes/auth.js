const router = require("express").Router();
const User = require("../models/User.js");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//Register
router.post("/register", async (req, res) => {
  try {
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      //เข้ารหัส password
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
    });
    const user = newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    //ตรวจสอบ email
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("email ไม่ถูกต้อง");

    //แก้รหัส password
    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    originalText !== req.body.password &&
      res.status(401).json("รหัสผ่านไม่ถูกต้อง");

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );

    //แยกตัวแปรเพื่อไม่ให้แสดงข้อมูล password
    const { password, ...info } = user._doc;

    res.status(200).json({ ...info, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
