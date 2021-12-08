'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Utilisateur = require("../models/utilisateur");

router.get('/', async function (req, res) {
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

router.get('/:id', async function (req, res) {
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
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var nouvel_utilisateur = new Utilisateur(req.body)
        res.json(await nouvel_utilisateur.save())
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

router.put('/:id', async function (req, res) {
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

router.delete('/:id', async function (req, res) {
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
