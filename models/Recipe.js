const mongoose = require("mongoose");
//RECIPE SCHEMA
const recipeSchema = new mongoose.Schema({
    title: String,
    body: String,
    dateCreated: {type: Date, default: Date.now},
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
})

module.exports = mongoose.model("Recipe", recipeSchema);