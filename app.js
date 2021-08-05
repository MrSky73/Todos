const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aakash:aakash0108@cluster0.qowyd.mongodb.net/todoListDB" , { useNewUrlParser: true});

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({name: "Welcome to your ToDoList"});
const item2 = new Item({name: "Hit the + button to add a new todo"});
const item3 = new Item({name: "<---- Hit this to delete the item"});

const defaultItems = [item3 , item2 , item1];

const listSchema = {
  name : String ,
  items: [itemsSchema]
};

const List = mongoose.model("List" , listSchema);


app.get("/", (req, res) => {

Item.find({} , (err ,foundItem) => {

  if (foundItem.length === 0) {
    Item.insertMany(defaultItems , err => {
      if (err) {
        console.log(err)
      } else {
        console.log("items added");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItem});
  }
});

});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customListName", (req , res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) => {
    if (!err){
      if (!foundList){
        //Create a new list 
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});


app.post("/delete" , (req , res)=> {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, result) => {
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
})


app.get("/about", (req, res) =>{
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port , () => {
  console.log("Server started on port 3000");
});

