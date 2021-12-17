'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Action = require("../models/action");
const fetch = require('node-fetch');
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
    await mongoose.connect(process.env.MONGODB_APP_URI);
    try {
        const actions = await Action.find();
        res.json(actions);
    } catch (exception) {
        res.status(500).json({
            "exception": {
                "errors": exception
            }
        })
    } finally {
        mongoose.connection.close();
    }
});

router.get('/:symbole', authentifierToken, async function (req, res) {
    await mongoose.connect(process.env.MONGODB_APP_URI);
    const action = await Action.findOne({ symbole: req.params.symbole });
    if (action === null)
    {
        var requestOptions = {
            method: 'GET',
            headers: {
                "x-api-key": process.env.CLE_API_YAHOO_FINANCE
            },
            redirect: 'follow'
        };

        //Obtenir données historique sur l'action
        await fetch("https://yfapi.net/v8/finance/spark?interval=1d&range=6mo&symbols=" + req.params.symbole, requestOptions)
            .then(response => response.text())
            .then(async function (resultatHistoriqueActionJSON) {
                var resultatHistoriqueAction = JSON.parse(resultatHistoriqueActionJSON)
                var tableauResultatHistorique = resultatHistoriqueAction[req.params.symbole].timestamp.map((timestampActuel, index) => {
                    return {
                        "date": new Date(timestampActuel * 1000).toLocaleDateString("fr-CA"),
                        "prix": resultatHistoriqueAction[req.params.symbole].close[index]
                    }
                })

                //Obtenir plus d'informations sur l'action
                await fetch("https://yfapi.net/v6/finance/quote?symbols=" + req.params.symbole, requestOptions)
                    .then(response => response.text())
                    .then(async function(resultatInformationActionJSON) {
                        await mongoose.connect(process.env.MONGODB_APP_URI);

                        var resultatInformationAction = JSON.parse(resultatInformationActionJSON)

                        console.log(resultatInformationAction.quoteResponse.result[0])

                        var action = new Action({
                            "nom": resultatInformationAction.quoteResponse.result[0].longName ? resultatInformationAction.quoteResponse.result[0].longName: req.params.symbole ,
                            "symbole": req.params.symbole,
                            "marche": resultatInformationAction.quoteResponse.result[0].exchangeTimezoneName,
                            "monnaie": resultatInformationAction.quoteResponse.result[0].financialCurrency,
                            "historique_valeur": tableauResultatHistorique
                        });

                        res.json(await action.save());

                        mongoose.connection.close()
                    })
                    .catch(function (erreur) {
                        mongoose.connection.close()
                        res.status(500).json({
                            "exception": {
                                "errors": erreur
                            }
                        })
                    });
            })
            .catch(function (erreur) {
                mongoose.connection.close()
                res.status(500).json({
                    "exception": {
                        "errors": erreur
                    }
                })
            });
    }
    else {
        mongoose.connection.close();
        res.json(action);
    }
});

router.get('/:id/actualiser', authentifierToken, async function(req, res) {
    await mongoose.connect(process.env.MONGODB_APP_URI);
    const action = await Action.findOne({ _id: req.params.id });
    if (action !== null) {
        var requestOptions = {
            method: 'GET',
            headers: {
                "x-api-key": process.env.CLE_API_YAHOO_FINANCE
            },
            redirect: 'follow'
        };

        //Obtenir données historique sur l'action
        await fetch("https://yfapi.net/v8/finance/spark?interval=1d&range=6mo&symbols=" + action.symbole, requestOptions)
            .then(response => response.text())
            .then(async function (resultatHistoriqueActionJSON) {
                var resultatHistoriqueAction = JSON.parse(resultatHistoriqueActionJSON)
                var tableauResultatHistorique = resultatHistoriqueAction[action.symbole].timestamp.map((timestampActuel, index) => {
                    return {
                        "date": new Date(timestampActuel * 1000).toLocaleDateString("fr-CA"),
                        "prix": resultatHistoriqueAction[action.symbole].close[index]
                    }
                })

                action.historique_valeur = tableauResultatHistorique;

                res.json(await action.save())
            })
            .catch(function(erreur) {
                mongoose.connection.close()
                res.status(500).json({
                    "exception": {
                        "errors": erreur
                    }
                })
            });
    }
    else {
        mongoose.connection.close();
        res.status(400).json({
            "exception": {
                "errors": {
                    "_id": {
                        "name": "NotFoundError",
                        "message": "Une action par cette id n'existe !",
                        "properties": {
                            "message": "Une action par cette id n'existe !",
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
});

//Permet de modifier une des actions
router.put('/:id', authentifierToken, async function(req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var resultat = await Action.updateOne({ "_id": req.params.id }, req.body);
        res.json(resultat)
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

router.delete('/:id', authentifierToken, async function(req, res) {
    try {
        await mongoose.connect(process.env.MONGODB_APP_URI);
        var resultat = await Action.findByIdAndDelete(req.params.id)

        if (resultat) {
            res.json(resultat)
        }
        else {
            res.status(400).json({
                "exception": {
                    "errors": {
                        "_id": {
                            "name": "NotFoundError",
                            "message": "Une action par cette id n'existe !",
                            "properties": {
                                "message": "Une action par cette id n'existe !",
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
