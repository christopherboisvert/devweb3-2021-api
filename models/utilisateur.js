const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UtilisateurSchema = new Schema(
    {
        "courriel": { type: String, unique: true, required: [true, 'Le courriel est requis !'] },
        "mot_de_passe": { type: String, required: [true, 'Le mot de passe est requis !'] },
        "prenom": { type: String, required: [true, 'Le prénom est requis !'] },
        "nom": { type: String, required: [true, 'Le nom est requis !'] },
        "est_actif": { type: Boolean, default: false }
    },
    {
        "strict": true
    }
);

module.exports = mongoose.model("Utilisateur", UtilisateurSchema);