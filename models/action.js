const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PointAction = new Schema(
    {
        "_id":false,
        "date": Date,
        "prix": Number
    },
    {
        "strict": true
    }
);
const ActionSchema = new Schema(
    {
        "nom": { type: String, unique: true, required: true },
        "symbole": { type: String, required: true },
        "marche": { type: String, required: true },
        "monnaie": { type: String, required: true },
        "type_activite": [String],
        "historique_valeur": [PointAction]
    },
    {
        "strict": true
    }
);

module.exports = mongoose.model("Action", ActionSchema);