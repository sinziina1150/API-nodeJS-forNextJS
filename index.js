const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require("cors");
const bodyParser = require("body-parser");
const animal = require("./controller/animal");
const path = require("path");
const fs = require("fs");
const http = require("https");
const useranimal = require("./controller/useranimal");

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.static(__dirname));
app.use(express.static("./src"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static("./src/upload"));
app.use(express.static("./src/ImageUser"))


// สำหรับ สร้าง Path ในการใช้งาน
app.use("/animals", animal);
app.use("/useranimal", useranimal);


app.listen(PORT, () => {
  console.log("Server is Running");
});
