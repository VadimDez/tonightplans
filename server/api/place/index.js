'use strict';

var express = require('express');
var controller = require('./place.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', auth.attachUser(), controller.index);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;
