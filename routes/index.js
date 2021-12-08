'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Développement web 3 - Api du projet final' });
});

module.exports = router;
