const multer = require("multer");
const path = require("path");


// ฟังชั่น สำหรับ check type ไฟล์
const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// ฟังชั่น สำหรับ ที่เก็บไฟล์รูปและ create FIle name 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/upload/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString().replace(/:/g, "-") + file.originalname);
  },
});

let upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
// ฟังชั่น สำหรับ ที่เก็บไฟล์รูปและ create File name 
const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/ImageUser");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString().replace(/:/g, "-") + file.originalname);
  },
});

const uploadImageUser = multer({
  storage: storageUser,
  fileFilter: fileFilter,
});

module.exports = { upload, uploadImageUser };
