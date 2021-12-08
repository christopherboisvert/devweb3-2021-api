const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActionAchat = new Schema(
    {
        "date": String,
        "prix": Number
    },
    {
        "strict": true
    }
);
const PortfolioSchema = new Schema(
    {
        "nom": { type: String, unique: true, required: [true, 'Le nom est requis !'] },
        "liste_action": [ActionAchat]
    },
    {
        "strict": true
    }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);