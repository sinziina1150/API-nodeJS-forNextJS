const express = require("express");
const app = express();
const db = require("../config/config");
const router = express.Router();
const { uploadImageUser } = require("./upload");
const fs = require('fs')

// Router สำหรับ Login เพื่อเข้าสู้ระบบ
router.post("/login", (req, res) => {

  const body = {
    username: req.body.username,
    password: req.body.password,
  };

  // Query สำหรับดึงข้อมูลใน Databasse 
  const selectuser = `SELECT * FROM animals.useranimal where username = '${body.username}' and password = '${body.password}'`;

  // เช็คว่ามีข้อมูลส่งมาหรือไม่
  // ถ้าไม่มีให้ส่ง  status 500 กลับไปหา font-end 
  if (body.username === undefined && body.password === undefined) {
    res.status(500).send({ message: "ข้อมูลไม่ถูกต้อง" });
  } else {

    // แต่ถ้ามี ให้นำเข้ามูลไปเช็ตว่าข้อมูลถูกต้องหรือไม่
    db.query(selectuser, (err, result) => {
      if (err) throw err;
      // เช็คว่า มีข้อมูลหรือไม่
      if (result.length <= 0) {
        res.status(500).send("ข้อมูลไม่ถูกต้อง");
      } else {
        console.log(result);
        res.status(200).send({
          username: result[0].username,
          userID: result[0].userID,
          email: result[0].email,
          image: result[0].image,
        });
      }
    });
  }
});

// Router สำหรับ สมัครสมาชิก
router.post("/register", (req, res) => {
  const userID = random(8);
  const bodyUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    image: null,
  };
  console.log(bodyUser);
  // Query MYSQL สำหรับ Register
  const sqlInsertUser = `insert Into animals.useranimal (userID,username,password,email,image) values ('${userID}','${bodyUser.username}','${bodyUser.password}','${bodyUser.email}','${bodyUser.image}')`;
  const selectCheckID = `select * from animals.useranimal where username = "${bodyUser.username}"`;
  try {
    // นำ username มาเช็คมามีผู้ใช้งานแล้วหรือไม่
    db.query(selectCheckID, (err, reulstCheck) => {
      console.log(reulstCheck);
      if (err) throw err;
      if (reulstCheck != "") {
        res.status(500).send({
          message: "มี username นี้อยู่แล้ว",
        });
      } else {
        // แต่ถ้าไม่มี ก็ให้บันทึกข้อมูล ลง Database
        db.query(sqlInsertUser, (err, resultUser) => {
          if (bodyUser === undefined) {
            res.status(500).send({
              message: "Register Not Found",
              status: "Faild",
            });
          } else {
            res.status(200).send({
              message: "Register is correct",
              status: "success",
              data: resultUser,
            });
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// Router สำหรับ ดึงข้อมูล user ไปแสดง โดยนำ userID มาค้นหา
router.get("/GetByID/:userID", (req, res) => {
  const userID = req.params.userID;
  const sqlGetByID = `select * from animals.useranimal where userID = '${userID}'`;
  db.query(sqlGetByID, (err, result) => {
    if (err) {
      res.status(500).send({
        status: "Error Can't Found Get ID",
        data: err,
      });
    } else {
      res.status(200).send({
        status: "Get ID Success",
        data: result,
      });
    }
  });
});

// router สำหรับ แก้ไขข้อมูล user และ Upload รูป ภาพ
router.put("/editUser/:userID", uploadImageUser.single("image"), (req, res) => {
  const userID = req.params.userID;
  const ImageUser = req.file;
  const bodyUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  };
  // Query Sql  สำหรับ Update ข้อมูล
  const sqlEditUserText = `update useranimal set username='${bodyUser.username}',password='${bodyUser.password}',email='${bodyUser.email}' where userID = '${userID}'`;

  // ถ้าไม่มี File Image ให้ทำการ Update แต่ข้อมูลที่เป็น Text
  if (ImageUser == undefined) {
    db.query(sqlEditUserText, (err, resultUser) => {
      if (err) {
        res.status(404).send({
          status: "Faild",
          data: "Edit Data Not Found",
        });
      } else {
        res.status(200).send({
          status: "success",
          data: resultUser,
        });
      }
    });
  } else {

    // Query สำหรับ ค้นหา userID เพื่อนำข้อมูลมา แก้ไข
    const sqlGetByID = `select * from animals.useranimal where userID = '${userID}'`;
    db.query(sqlGetByID, (err, rs) => {
      // นำข้อมูล มูลแปลงเป็น JSON string
      const DeleteImage = JSON.parse(JSON.stringify(rs));
      // เช็คข้อมูลว่ามีรูปหรือไม่
      if(DeleteImage) {
        // ถ้ามีให้ทำการลบ รูปเก่าออกและเพิ่มรูปใหม่ลงไป
        fs.unlink("src/imageUser/" + DeleteImage[0].image, (err) => {
          const UploadFile = req.file.filename;
          const sqlEditUser = `update useranimal set username='${bodyUser.username}',password='${bodyUser.password}',email='${bodyUser.email}',image='${UploadFile}' where userID = '${userID}'`;
          //ถ้ามี File Image ให้ทำการ Update ข้อมูลทั้งหมด
          db.query(sqlEditUser, (err, resultUser) => {
            if (err) {
              res.status(404).send({
                status: "Faild",
                data: "Edit Data Not Found",
              });
            } else {
              res.status(200).send({
                status: "success",
                data: resultUser,
              });
            }
          });
        });
      }else {
        throw err
      }
    });
  }
});


// ฟังชั่น random ID เพื่อบันทึกลง Database
const random = (length = 8) => {
  return Math.random().toString(16).substr(2, length);
};

module.exports = router;
