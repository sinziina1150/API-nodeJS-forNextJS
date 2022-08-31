const mysql = require("mysql");


// เชื่อมต่อ Database My sql
const db = mysql.createConnection({
  user: "root",
  password: "",
  port: "3306",
  database: "animals",
});

db.connect(function (err) {
  if (err) throw err;

  console.log("Database is Running");
});

module.exports = db;
