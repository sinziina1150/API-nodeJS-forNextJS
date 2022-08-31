const express = require("express");
const app = express();
const {upload,uploadImageUser} = require("./upload");
const db = require("../config/config");
const router = express.Router();
const path = require("path");
const fs = require("fs");


// ดึงข้อมูลของตาราง animal
router.get("/getallanimal", (req, res) => {
  const sqlSelectdata = `select * FROM animals.animal group by update_time`;
  db.query(sqlSelectdata, (err, reulst) => {
    if (err) throw err;
    res.status(200).send(reulst);
  });
});


// path สำหรับ เพิ่มข้อมูล amimal และรูป
router.post("/upload", upload.single("image"), (req, res) => {
  const animalID = random(5);

  // ประกาศตัวแปลเพื่อนำเข้าข้อมูลที่ได้จาก Body   
  const body = {
    name: req.body.name,
    image: req.file.filename,
    weight: req.body.weight,
    heigth: req.body.heigth,
    userID: req.body.userID,
  };
  // query สำหรับ เพิ่มข้อมูล ลง Database
  const sqlqueryInsert = `INSERT INTO  animals.animal (animalID,name ,  image ,  weight ,  heigth , userID) VALUES ('${animalID}','${body.name}','${body.image}','${body.weight}','${body.heigth}','${body.userID}')`;
  db.query(sqlqueryInsert, (err, result) => {
    if (err) throw err;
    // เช็คว่ามีข้อมูลมาหรือไม่
    if (
      body.name.length === 0 &&
      body.weight.length === 0 &&
      body.name.length === 0 &&
      body.heigth.length === 0
    ) {
      // ถ้าไม่มีให้ส่ง Status 500 และข้อความ Error
      res.status(500).send({
        message: "Error",
        result: err,
      });
    } else {
      // ถ้าสำเร็จให้ส่ง Status 200 และข้อความ Success
      res.status(200).send({
        message: "Success",
        result: result,
      });
    }
  });
});
// path สำหรับ ดึงข้อมูล เฉพาะ ID นั้นๆ 
router.get("/getanimalByid/:id", (req, res) => {
  const queryId = req.params.id;
  const sqlqueryId = `select * from animals.animal where animalID = '${queryId}'`;

  db.query(sqlqueryId, (err, result) => {
    if (err) throw err;

    res.status(200).send(result);
  });
});


// path สำหรับแก้ไขข้อมูล
router.put("/editData/:id", upload.single("image"), (req, res) => {

    // ประกาศตัวแปลเพื่อนำเข้าข้อมูลที่ได้จาก params
  const id = req.params.id;

  // SQL query animal ID 
  const selectIdImage = `select * from animals.animal where animalID = '${id}'`;

  // ประการตัวแปลสำหลับ หาไฟล์
  const imageFile = req.file;
  // ประกาศตัวแปลเพื่อนำเข้าข้อมูลที่ได้จาก Body   
  const body = {
    name: req.body.name,
    weight: req.body.weight,
    heigth: req.body.heigth,
  };

  // query สำหรับเช็คว่า มีไฟล์ Image หรือไม่
  db.query(selectIdImage, (err, rs) => {
    const images = JSON.parse(JSON.stringify(rs));
    if (!imageFile) {
      // ถ้าไม่มีก็ให้ อัพเดท แค่ข้อมูล Text 
      console.log("Not Delete");
      const sqlEditData = `update animals.animal set name='${body.name}' , weight='${body.weight}',heigth='${body.heigth}' where animalID = '${id}'`;
      db.query(sqlEditData, (err, result) => {
        if (err) throw err;
        res
          .status(200)
          .send({ message: "Edit Data Successfully", Data: result });
      });
    } else {
      // ถ้ามีก็ให้ทำการลบภาพเก่าออกและเพิ่มภาพใหม่ลงไป
      fs.unlink("src/upload/" + images[0].image, (err) => {
        if (err) {
          console.log(err);
        } else {
          const sqlEditImageData = `update animals.animal set name='${body.name}' , weight='${body.weight}',heigth='${body.heigth}', image='${imageFile.filename}' where animalID = '${id}'`;
          db.query(sqlEditImageData, (err, result) => {
            if (err) throw err;
            res
              .status(200)
              .send({ message: "Edit Data Successfully", Data: result });
          });
        }
      });
    }
  });
});
// path สำหรับลบข้อมูล
router.delete("/deletedata/:id", (req, res) => {
  const id = req.params.id;
  const deleteFile = `select * FROM animals.animal WHERE animalID = '${id}'`;
  const sqldelete = `DELETE FROM animals.animal WHERE animalID = '${id}'`;
 // query สำหรับลบข้อมูลเช็คว่ามีไฟล์ image หรือไม่
  db.query(deleteFile, (err, result) => {
    // ถ้า Error ให้ส่งออกไป Error 
    if (err) throw err;

    // query สำหรับ ลบข้อมูลออกจาก Database 
    db.query(sqldelete, (err, rs) => {
      const images = JSON.parse(JSON.stringify(result));
      if (err) {
        console.log(err);
        res.status(500).send({ message: "Delete not Found" });
      } else {
        // สำหรับลบรูปภาพออกจาก Folder
        fs.unlink("src/upload/" + images[0].image, (err) => {
          if (err) {
            console.log(err);
            return;
          }
          res.status(200).send({ message: "Delete SuccessFully", data: rs });
        });
      }
    });
  });
});


// path สำหรับ ดึงข้อมูล History 
router.get("/history/:userID", (req, res) => {

  const sqlHistory = `select animal.animalID,animal.name,animal.weight,animal.heigth,animal.image,useranimal.username
    from animal
    inner Join useranimal
    on animal.userID = useranimal.userID
    where animal.userID = "${req.params.userID}"`;
    
    // query สำหรับ select ข้อมูล History
  db.query(sqlHistory, (err, result) => {
    if (err) {
        console.log(err)
      res.status(500).send({
        status: "requset Filed",
        data: "not Found",
      });
    } else {
      res.status(200).send({
        status: "Success",
        data: result,
      });
    }
  });
});

const random = (length = 8) => {
  return Math.random().toString(16).substr(2, length);
};

module.exports = router;
