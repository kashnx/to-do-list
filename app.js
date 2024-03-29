const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv=require("dotenv");

dotenv.config();
const app = express();
// var items=["Buy Food","Cook Food","Eat Food"];
// let workItems=[];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
   await mongoose.connect(process.env.MONGODB_CONNECT);
  // await mongoose.connect('mongodb://127.0.0.1:27017/blogDB');
}
//schema
const itemsSchema = new mongoose.Schema({
  name: String
});
//model
const Item = mongoose.model("Item", itemsSchema);
//document
const item1 = new Item({ name: "Welcome to your to do list" });
const item2 = new Item({ name: "Hit + button to add item" });
const item3 = new Item({ name: "-- Hit this to delete item" });


const DefaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", async function (req, res) {
  var today = new Date();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };


  var day = today.toLocaleDateString("en-US", options);

  let foundItems = await Item.find({});
  try {
    if (foundItems.length === 0) {
      foundItems = await Item.insertMany(DefaultItems);
    }

  } catch (err) {
    console.log(err);
  };



  res.render("list", {
    listTitle: day, newItem: foundItems
  });
});


app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  item
    .save()
    .then(() => {
      console.log("Inserted new item to db");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);

    });


});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  Item
    .findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Deleted item successfully");
    })
    .catch((err) => {
      console.log(err);
    });
  res.redirect("/");
});


app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {

        const list = new List({
          name: customListName,
          items: DefaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newItem: foundList.items });
      }
    })
    .catch((err) => {
      console.log(err);
    });


});


// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newItem: workItems });
// });
app.post("/work", function (req, res) {

  let item = req.body.newItem;

  workItems.push(item);
  res.redirect("/work");
});
app.listen(3001, function () {
  console.log("server is running on port 3000");
});