'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var PlaceSchema = new mongoose.Schema({
  name: String,
  image: String,
  categories: [String],
  rating: String,
  review: String,
  yelp_id: String,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

export default mongoose.model('Place', PlaceSchema);
