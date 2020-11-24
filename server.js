const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
const Recipe = require("./models/Recipe");
const Comment = require("./models/Comment");
const app = express();
const db = mongoose.connection;
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/'+ `recipeapp`;

mongoose.connect(MONGODB_URI,  { useNewUrlParser: true, useUnifiedTopology: true});

// Error / success
db.on('error', (err) => console.log(err.message + 'is Mongod not running?'));
db.on('connected', () => console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', () => console.log('mongo disconnected'));

// open the connection to mongo
db.on('open' , ()=>{});

//CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// ROUTES
app.get("/", function(req, res){
    res.redirect("/recipes");
})

//INDEX ROUTE
app.get("/recipes", function(req, res){
    Recipe.find({}, function(err, recipes){
        if(err){
            console.log("Error!");
        }
        else{
            res.render("recipes/index", {recipeList: recipes});
        }
    })   
})

//NEW ROUTE
app.get("/recipes/new", function(req, res){
    res.render("recipes/new");
})

//CREATE ROUTE
app.post("/recipes", function(req, res){
    req.body.recipe.body = req.sanitize(req.body.recipe.body);
    Recipe.create(req.body.recipe, function(err, newRecipe){
        if(err){
            res.render("recipes/new")
        }
        else{
            res.redirect("/recipes")
        }
    })
})

//SHOW ROUTE
app.get("/recipes/:id", function(req, res){
    Recipe.findById(req.params.id).populate("comments").exec(function(err, foundRecipe){
        if(err){
            res.redirect("/recipes")
        }
        else{
            res.render("recipes/show", {recipe: foundRecipe})
        }
    })
})

//EDIT ROUTE
app.get("/recipes/:id/edit", function(req, res){
    Recipe.findById(req.params.id, function(err, foundRecipe){
        if(err){
            res.redirect("/recipes")
        }else{
            res.render("recipes/edit", {recipe: foundRecipe})
        }
    })
})

//UPDATE ROUTE
app.put("/recipes/:id", function(req, res){
    req.body.recipe.body = req.sanitize(req.body.recipe.body);
    Recipe.findByIdAndUpdate(req.params.id, req.body.recipe, function(err, updatedRecipe){
        if(err){
            res.redirect("/recipes");
        }
        else{
            res.redirect("/recipes/"+req.params.id)
        }
    })
})

app.delete("/recipes/:id/", function(req, res){
    Recipe.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/recipes")
        }
        else{
            res.redirect("/recipes")
        }
    })
})

//========================
//COMMENTS ROUTES
//========================

app.get("/recipes/:id/comments/new", function(req, res){
    Recipe.findById(req.params.id, function (err, recipe) {
        if(err){
            console.log("Error!");
        }
        else{
            res.render("comments/new", {recipe: recipe})
        }
    })
})

app.post("/recipes/:id/comments", function(req, res){
    Recipe.findById(req.params.id, function(err, recipe){
        if(err){
            console.log("Error!")
            res.redirect("/recipes")
        }
        else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log("Error!")
                }else{
                    recipe.comments.push(comment);
                    recipe.save();
                    res.redirect("/recipes/" + req.params.id)
                }
            })
        }
    })
})


app.listen(PORT, () => console.log( 'Listening on port:', PORT));