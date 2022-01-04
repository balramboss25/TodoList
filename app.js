const mongoose = require('mongoose');

const express = require("express");
const bodyPasrser = require("body-parser");
const request = require("request");
const _= require("lodash");
 	const app = express();
 	app.set('view engine', 'ejs');
 	app.use(bodyPasrser.urlencoded({extended:true}));
 	app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-balram:balloooo25@cluster0.yafnq.mongodb.net/todoListDB', {useNewUrlParser: true, useUnifiedTopology: true});
//itme schema creation
const itemsSchema = new mongoose.Schema({
  name :{
    type:String,
    required:[1,"empty name cant inserted"]
  }
});
//collection creation : model creation
const Item = mongoose.model("Item",itemsSchema);
//diffrent items
const item1 = new Item({
  name : "Welcome to our Todo list"
});
const item2 = new Item({
  name : "hit the + button to add new Item"
});
const item3 = new Item({
  name : "<--- hit this to delete the iteme"
});
//array of items
const defaultItems = [item1,item2,item3];

const listSchema =new mongoose.Schema({
  name:{
    type:String,
    required:[1,"empty name cant inserted"]
  },
  items : [itemsSchema]
});

const List = mongoose.model("List",listSchema);

// to send the html page to the website
 	app.get("/",function(req,res){

    Item.find(function(err,foundItems){
      if(foundItems.length === 0)
      {
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else {
            console.log("inserted succesfully to the todoListDB collection items");
          }
        });
        res.redirect("/");
      }
      else{
      res.render("list",{varr:"Today",nsitem:foundItems});
    }
    });
 	});
  //dynamic paging
  app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    if(customListName==="favicon.ico")
    {
      res.redirect("/");
    }
    else{
    List.findOne({name:customListName}, function(err,foundList){
      if(!err){
        if(!foundList){
          const list = new List({
          name:customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
        }
        else
        {
          res.render("list",{varr:foundList.name,nsitem:foundList.items});
        }
      }
    });
  }

  });
//post wala section jisme request bhi h
 	app.post("/",function(req,res){

 		let itemName = req.body.nitem;
    let listName = req.body.list;
 		const item = new Item({
      name:itemName
    });
    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }
    else {
      List.findOne({name:listName}, function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
    }

 	});

  app.post("/delete",function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(!err)
      {
        console.log("succesfully deleted the document from Item collection");
      }
    });
    res.redirect("/");
  }
  //for dynamic lists here ...deleting process will go on
  else {
    List.findOneAndUpdate(
      {name:listName},
      {$pull:{items:{_id:checkedItemID}}},
      function(err,foundList){
        if(!err)
        {
          res.redirect("/"+listName);
        }
      }
    );
  }

  });




///listen wala section
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 	app.listen(port,function(){
 		console.log("server is listening on 3000 port no");
 	});
