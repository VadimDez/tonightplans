/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/places              ->  index
 * PATCH   /api/places/:id          ->  update users
 */

'use strict';

import _ from 'lodash';
var Place = require('./place.model');
var oauthSignature = require('oauth-signature');
var Location = require('./location.model.js');
var https = require('https');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(user) {
  return function(entity) {
    //var updated = _.merge(entity, updates);
    let index = entity.users.indexOf(user);

    if (index === -1) {
      entity.users.push(user);
    } else {
      entity.users.splice(index, 1);
    }

    return entity.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function generateRandomString() {
  return 'kllo9940pd9333jh';
}

// Gets a list of Places
export function index(req, res) {
  var locationName = req.query.location;

  if (!locationName) {
    res
      .status(400)
      .send({
        errors: [{
          status: 400,
          title: 'location is missing'
        }]
      })
      .end();

    return;
  }

  locationName = locationName.toLowerCase();

  Location.findAsync({name: locationName})
    .then((locations) => {

      if (!locations.length) {
        Location.createAsync({name: locationName})
          .then(location => {

            getPlaces(location)
              .then(responseWithResult(res))
              .catch(handleError(res, 400));
          })
          .catch(handleError(res, 400));

        return;
      }

      getPlaces(locations[0])
        .then(responseWithResult(res))
        .catch(handleError(res, 400));
    })
    .catch(handleError(res, 400));
}

function getPlaces(location) {
  return new Promise(function (resolve, reject) {
    var requested = new Date(location.requested);
    var now = new Date();
    requested.setHours(0, 0, 0);
    now.setHours(0, 0, 0);

    if (now.toDateString() !== requested.toDateString()) {
      Location.updateAsync({name: location.name}, {$set: {requested: Date.now()}})
        .catch(error => {
          reject(Error(error));
        });

      getPlacesFromYelp(location.name)
        .then(json => {

          // insert places
          insertYelpPlaces(json.businesses, location._id)
            .then(places => {
              resolve(places);
            })
            .catch(error => {
              reject(Error(error));
            });
        })
        .catch(function (error) {
          reject(Error(error));
        });

      return;
    }

    Place.findAsync({location: location._id})
      .then(places => {
        resolve(places);
      })
      .catch(error => {
        reject(Error(error));
      });
  });
}



function insertYelpPlaces(places, locationId) {
  return new Promise(function (resolve, reject) {
    var placesList = places.map(function (place) {
      return {
        yelp_id: place.id,
        name: place.name,
        image: place.image_url,
        rating: place.rating,
        review: place.snippet_text,
        location: locationId,
        users: [],
        categories: place.categories.map(function (category) {
          return category[0]
        })
      };
    });

    Place.collection.insert(placesList, {}, function (err, docs) {

      if (err) {
        reject(Error(err));
      } else {
        resolve(docs.ops);
      }
    });
  });
}

function getPlacesFromYelp(location) {
  return new Promise(function (resolve, reject) {
    var httpMethod = 'GET';
    var url = 'https://api.yelp.com/v2/search';
    var parameters = {
      oauth_consumer_key : process.env.YELP_CUSTOMER_KEY,
      oauth_token : process.env.YELP_TOKEN,
      oauth_nonce : generateRandomString(),
      oauth_timestamp : (new Date()).getTime(),
      oauth_signature_method : 'HMAC-SHA1',
      oauth_version : '1.0',
      term: 'bar',
      location: location
    };

    // generates a BASE64 encode HMAC-SHA1 hash
    parameters.oauth_signature = oauthSignature.generate(httpMethod, url, parameters, process.env.YELP_CUSTOMER_SECRET, process.env.YELP_TOKEN_SECRET, { encodeSignature: true});

    url += '?' + Object.keys(parameters).map(key => {
      return key + '=' + parameters[key];
    }).join('&');

    https.get(url, function(res) {
      var body = '';

      res.on('data', function (data) {
        body += data;
      });

      res.on('end', function () {
        resolve(JSON.parse(body))
      });

      // consume response body
      res.resume();
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      reject(Error(e.message));
    });
  });
}

// Updates an existing Place in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Place.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.user_id))
    .then(responseWithResult(res))
    .catch(handleError(res));
}
