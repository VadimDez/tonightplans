/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/places              ->  index
 * POST    /api/places              ->  create
 * GET     /api/places/:id          ->  show
 * PUT     /api/places/:id          ->  update
 * DELETE  /api/places/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Place = require('./place.model');
var oauthSignature = require('oauth-signature');

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

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Places
export function index(req, res) {
  var httpMethod = 'GET';
  var url = 'https://api.yelp.com/v2/search';
  var parameters = {
    oauth_consumer_key : 'RLZnAqoX1kYt5NujM_-wjw',
    oauth_token : 'CAR1HJ2WXVAGGvHJhgHczOlLb-8rbmry',
    oauth_nonce : 'kllo9940pd9333jh',
    oauth_timestamp : (new Date()).getTime(),
    oauth_signature_method : 'HMAC-SHA1',
    oauth_version : '1.0',
    term: 'food',
    location: 'San Francisco'
  };

  // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
  //parameters.oauth_signature = oauthSignature.generate(httpMethod, url, parameters, process.env.YELP_CUSTOMER_SECRET, process.env.YELP_TOKEN_SECRET);

  // generates a BASE64 encode HMAC-SHA1 hash
  parameters.oauth_signature = oauthSignature.generate(httpMethod, url, parameters, process.env.YELP_CUSTOMER_SECRET, process.env.YELP_TOKEN_SECRET, { encodeSignature: false});

  var https = require('https');

  url += '?' + Object.keys(parameters).map(key => {
      return key + '=' + parameters[key];
    }).join('&');

  https.get(url, function(resp) {
    var body = '';

    resp.on('data', function (data) {
      body += data;
    });

    resp.on('end', function () {
      res.send(JSON.parse(body));
      res.end();
    });
    // consume response body
    resp.resume();
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
    res.statusCode = 400;
    res.end();
  });


  //Place.findAsync()
  //  .then(responseWithResult(res))
  //  .catch(handleError(res));
}

// Gets a single Place from the DB
export function show(req, res) {
  Place.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new Place in the DB
export function create(req, res) {
  Place.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Place in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Place.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Place from the DB
export function destroy(req, res) {
  Place.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
