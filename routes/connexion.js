'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var Utilisateur = require("../models/utilisateur");

router.post('', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        const { courriel, mot_de_passe } = req.body;

        let utilisateur = await Utilisateur.findOne({ courriel: courriel })

        if (!utilisateur) {
            return res.json({ erreur: "Veuillez entrer un nom d'identifiant valide !" });
        }

        bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe, function (err, result) {
            if (!err && result) {
                const accessToken = jwt.sign(
                    { identifiant, id: utilisateur._id },
                    process.env.CLE_TOKEN,
                    {
                        expiresIn: process.env.NODE_ENV === "production" ? "6h" : "2 days",
                    }
                );
                res.json({ message: "Vous êtes connecté !", token: accessToken });
            }
            else {
                res.json({ message: "Vos identifiants sont invalides !" })
            }
        });
    } catch (err) {
        console.log(err);
        res.json({ erreur: 'Une erreur est survenue, veuillez rententez plus tard !' });
    }
})

module.exports = router;
