'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Portfolio = require("../models/portfolio");

router.get('/', async function (req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var liste_portfolio = await Portfolio.find({})
        res.json(liste_portfolio)
    }
    catch (exception) {
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
        var portfolio = await Portfolio.findOne({ "_id": req.params.id })
        res.json(portfolio)
    }
    catch (exception) {
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
        var nouvel_portfolio = new Portfolio(req.body)
        res.json(await nouvel_portfolio.save())
    }
    catch (exception) {
        if (exception.code === 11000) {
            res.status(400).json({
                "exception": {
                    "errors": {
                        "nom": {
                            "name": "UniqueIndexError",
                            "message": "Ce nom de portfolio est déjà pris !",
                            "properties": {
                                "message": "Ce nom de portfolio est déjà pris !",
                                "type": "unique",
                                "path": "nom"
                            },
                            "kind": "unique",
                            "path": "nom"
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
        var resultat = await Portfolio.update({ "_id": req.params.id }, req.body);
        res.json(resultat)
    }
    catch (exception) {
        if (exception.code === 11000) {
            res.status(400).json({
                "exception": {
                    "errors": {
                        "nom": {
                            "name": "UniqueIndexError",
                            "message": "Ce nom de portfolio est déjà pris !",
                            "properties": {
                                "message": "Ce nom de portfolio est déjà pris !",
                                "type": "unique",
                                "path": "nom"
                            },
                            "kind": "unique",
                            "path": "nom"
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
        var resultat = await Portfolio.findByIdAndDelete(req.params.id)

        if (resultat) {
            res.json(resultat)
        }
        else {
            res.status(400).json({
                "exception": {
                    "errors": {
                        "_id": {
                            "name": "NotFoundError",
                            "message": "Un portfolio par cet id n'existe pas !",
                            "properties": {
                                "message": "Un portfolio par cet id n'existe pas !",
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
