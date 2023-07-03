const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todo list",
});

const item2 = new Item({
  name: "hit the button",
});

const item3 = new Item({
  name: "hit this one to delete item",
});

const defaultItems = [item1, item2, item3];
//this schema is we use when we try using the route and pass through there for instanse /work or whatever and there is below the logic of the rest
const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

//this get method is to put may lists the using the insertMany mongodb syntax
app.get("/", function (req, res) {
  Item.find({}).then((foundItems) => {
    if (foundItems.length === 0) {
      async function insertDefaultItems() {
        try {
          await Item.insertMany(defaultItems);
          console.log("Documents successfully inserted.");
        } catch (error) {
          console.error(error);
        }
      }

      insertDefaultItems();

      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

//.............this below code works to make another lists and it works by using / in the url whatever we wnat to create new lists

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName })
    .exec()
    .then(function (foundList) {
      if (!foundList) {
        //  create a new list

        const newList = new List({
          name: customListName,
          items: defaultItems,
        });
        newList.save();
        res.redirect("/" + customListName);
      } else {
        // it shows an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .exec()
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
  }
});

app.post("/delete", function (req, res) {
  const itemId = req.body.itemId;

  Item.findByIdAndRemove(itemId)
    .then(() => {
      console.log("Successfully deleted");
      res.redirect("/");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error occurred while deleting the item.");
    });
});

// app.post("/work", function (req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(4040, function () {
  console.log("starting server at port 4040");
});
