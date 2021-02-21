//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const _ = require("lodash");


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//setting database
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://admin-kshitij:Test123@cluster0.cdg7o.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item", itemsSchema
);

const item1 = new Item({
  name: "Welcome to ToDoList"
});

const item2 = new Item({
  name: "Hit the + sign to add any new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete"
});

const defaultItems = [item1, item2, item3];

const workItems = [];

app.get("/", function(req, res) {

  Item.find({}, function(err, items) {

    if (err) {
      console.log(err);
    } else {

      if (items.length == 0) {

        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Added successfully!");
          }
        })

        res.redirect("/");

      } else {

        console.log(items);
        res.render("list", {
          listTitle: "Today",
          newListItems: items
        });

      }
    }

  })

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;

  const curr_title = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(curr_title == 'Today'){

    item.save();

    res.redirect("/");
  }

  else{

    List.findOne({name : curr_title} , function(err , result){

      result.items.push(item);
      result.save();
      res.redirect("/" + curr_title);
    })

  }
});

app.post("/delete", function(req, res) {

  var curr_title= req.body.ListName;

  var curr_id = req.body.checkbox;

  if(curr_title == "today"){

    Item.deleteOne({
      _id: req.body.checkbox
    }, function(err) {

      if (err) {
        console.log(err);
      } else {

        console.log("done!");
      }
    });
    res.redirect("/")

  }

  else{

    List.findOneAndUpdate({name : curr_title} , {$pull : {items : {_id : curr_id}}} , function(err , found){

      if(!err){

        res.redirect("/" + curr_title);
      }
    } )
  }
})

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema);

app.get("/:param", function(req, res) {
  const curr_name = _.capitalize(req.params.param);

  List.findOne({
    name: curr_name
  }, function(err, result) {

    if (err) {
      console.log(err);
    } else {

      if (result) {

        res.render("list", {
          listTitle: curr_name,
          newListItems: result.items
        });
      } else {

        const list = new List({
          name: curr_name,
          items: defaultItems
        })

        list.save();
        res.redirect("/" + curr_name)

      }
    }
  })

})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
