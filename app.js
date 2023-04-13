const express = require("express");
const bodyParser = require("body-parser");

const app = express();
var items = ["wakeup early", "read some hours", "go to work"];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  var day = today.toLocaleDateString("en-us", options);

  res.render("list", { kindOfDay: day, newListItems: items });
});

app.post("/", function (req, res) {
  var item = req.body.newItem;
  items.push(item);
  res.redirect("/");
});

app.listen(4040, function () {
  console.log("starting server at port 4040");
});
