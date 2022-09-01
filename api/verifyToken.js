const jwt = require("jsonwebtoken");

function verify(req, res, next) {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    //ตรวจสอบว่า token กับ signature ถูกต้องหรือไม่
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) res.status(403).json("Token ไม่ถูกต้อง");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("คุณไม่ผ่านการพิสูจน์และยืนยันตัวตน");
  }
}

module.exports = verify;
