const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
require('dotenv').config() ;


const homeStartingContent = "Welcome to my personal blog! This website serves as a platform for me to share my thoughts, experiences, and ideas with you. Here, you'll find a collection of articles covering various topics, including travel, technology, lifestyle, and more. I believe in the power of storytelling and the impact it can have on connecting people from different walks of life. Through my blog, I aim to inspire, entertain, and provide valuable insights to my readers.";
const aboutContent = "Thank you for visiting my blog, and I hope you enjoy reading the articles as much as I enjoy writing them. Feel free to explore the different sections, leave comments, and subscribe to stay updated with the latest posts. Happy reading!";
const contactContent = "As the owner and author of this blog, my name is Saatvik Srivastava. I'm a passionate programmer who loves to code especially backend. This a normal website I made for fun. I am looking forward to add some other functionalities like login and signup soon. I don't have much time right now, so thisis it for now.";
const mando= "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Yeah it looks boring I know.";

const app = express();

mongoose.connect(process.env.MONG, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const postSchema ={
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

const p1=new Post({
  title:"Mandatory Post",
  content:mando
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {
  Post.find({})
    .maxTimeMS(15000)
    .then(function(posts) {
      res.render("home", {
        homecontent: homeStartingContent,
        posts: posts
      });
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send("An error occurred");
    });
});


app.get("/about",function(req,res){
  res.render("about",{abut:aboutContent});
});

app.get("/contact",function(req,res){
  res.render("contact",{cnct:contactContent});
});


app.get("/compose",function(req,res){
  res.render("compose");
});


app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postitle,
    content: req.body.postbody
  });

  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred");
    });
});

app.post("/savechanges", function(req, res) {
  const postId = req.body.savebutton;
  const updatedContent = req.body.updatedContent;
  Post.findByIdAndUpdate(postId, {content: updatedContent }, { new: true })
    .then((updatedPost) => {
      console.log('Post updated:', updatedPost);
      res.redirect('/');
    })
    .catch((err) => {
      console.error('Error updating post:', err);
      res.status(500).send('An error occurred');
    });
});

app.post("/delete", async function(req, res) {
  try {
    const itemToDelete = await Post.findById(req.body.delbutton);
    if (!itemToDelete) {
      return res.status(404).send("Item not found");
    }
    
    await itemToDelete.deleteOne();

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit", async function(req, res) {
  try {
    const itemToEdit = await Post.findById(req.body.editbutton);
    if (!itemToEdit) {
      return res.status(404).send("Item not found");
    }
    
    res.render('edit',{
      tite:itemToEdit.title,
      textContent:itemToEdit.content,
      id:itemToEdit._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/posts/:getName", async function(req, res) {
  try {
    const val = req.params.getName;
    const post = await Post.findOne({ _id: val });

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render("post", {
      tite: post.title,
      content: post.content,
      id: val
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.listen(port,()=>{
  console.log("Running on port");
})
