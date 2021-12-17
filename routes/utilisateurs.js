'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Utilisateur = require("../models/utilisateur");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const authentifierToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token === null) return res.status(401).json({ erreur: "Vous n'avez pas fournir de token !" });
    jwt.verify(token, process.env.CLE_TOKEN, (err, user) => {
        if (err) return res.status(401).json({ erreur: err });
        req.user = user;
        next();
    });
};

router.get('/', authentifierToken, async function (req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var liste_utilisateur = await Utilisateur.find({})
        res.json(liste_utilisateur)
    }
    catch (exception) {
        console.log(exception)
        res.status(500).json({
            "exception": {
                "errors": exception
            }
        })
    } finally {
        mongoose.connection.close();
    }
});

router.get('/:id', authentifierToken, async function (req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var liste_utilisateur = await Utilisateur.find({ "_id": req.params.id })
        res.json(liste_utilisateur)
    }
    catch (exception) {
        console.log(exception)
        res.status(500).json({
            "exception": {
                "errors": exception
            }
        })
    } finally {
        mongoose.connection.close();
    }
});

router.post('/', async function (req, res) {
    bcrypt.hash(req.body.mot_de_passe, saltRounds, async function (err, hash) {
        try {
            await mongoose.connect(process.env.MONGODB_APP_URI);
            if (!err)
            {
                req.body.mot_de_passe = hash
                var nouvel_utilisateur = new Utilisateur({
                    courriel: req.body.courriel,
                    mot_de_passe: hash,
                    prenom: req.body.prenom,
                    nom: req.body.nom,
                    est_actif: false
                })
                res.json(await nouvel_utilisateur.save())
            }
            else
            {
                res.status(500).json({
                    "exception": err
                })
            }
        }
        catch (exception) {
            console.log(exception)
            if (exception.code === 11000) {
                res.status(400).json({
                    "exception": {
                        "errors": {
                            "courriel": {
                                "name": "UniqueIndexError",
                                "message": "Ce courriel est déjà pris !",
                                "properties": {
                                    "message": "Ce courriel est déjà pris !",
                                    "type": "unique",
                                    "path": "courriel"
                                },
                                "kind": "unique",
                                "path": "courriel"
                            }
                        }
                    }
                })
            }
            else {
                res.status(500).json({
                    "exception": exception
                })
            }
        } finally {
            mongoose.connection.close();
        }
    });
});

router.put('/:id', authentifierToken, async function (req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var resultat = await Utilisateur.update({ "_id": req.params.id }, req.body);
        res.json(resultat)
    }
    catch (exception) {
        console.log(exception)
        if (exception.code === 11000) {
            res.status(400).json({
                "exception": {
                    "errors": {
                        "courriel": {
                            "name": "UniqueIndexError",
                            "message": "Ce courriel est déjà pris !",
                            "properties": {
                                "message": "Ce courriel est déjà pris !",
                                "type": "unique",
                                "path": "courriel"
                            },
                            "kind": "unique",
                            "path": "courriel"
                        }
                    }
                }
            })
        }
        else {
            res.status(500).json({
                "exception": {
                    "errors": exception
                }
            })
        }
    } finally {
        mongoose.connection.close();
    }
});

router.delete('/:id', authentifierToken, async function (req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var resultat = await Utilisateur.findByIdAndDelete(req.params.id)

        if (resultat) {
            res.json(resultat)
        }
        else {
            res.status(400).json({
                "exception": {
                    "errors": {
                        "_id": {
                            "name": "NotFoundError",
                            "message": "Un utilisateur par cet id n'existe pas !",
                            "properties": {
                                "message": "Un utilisateur par cet id n'existe pas !",
                                "type": "not-found",
                                "path": "_id"
                            },
                            "kind": "not-found",
                            "path": "_id"
                        }
                    }
                }
            })
        }
    }
    catch (exception) {
        console.log(exception)
        res.status(500).json({
            "exception": {
                "errors": exception
            }
        })
    } finally {
        mongoose.connection.close();
    }
});

module.exports = router;
