'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var LocationSchema = new mongoose.Schema({
  name: String,
  requested: {
    type: Date,
    default: null
  }
});

export default mongoose.model('Location', LocationSchema);
