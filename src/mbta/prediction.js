const fetch = require('node-fetch');
const api_key = require('./api_key');

module.exports = function (stop_id, direction_id) {

    const url = `https://api-v3.mbta.com/predictions?`
        + `api_key=${api_key}&`
        + `filter[stop]=${stop_id}&`
        + `filter[direction_id]=${direction_id}&`
        + `filter[route]=CR-Newburyport&`
        + `sort=departure_time&`
        + `page[limit]=10`;

    return fetch(url)
        .then(function (res) {
        return res.json();
    }).then(function (json) {
    return json.data.map(function (o) {
        return new Date(o.attributes.departure_time);
    })});

    // This is the ES6 Arrow notation of above
    //.then(res => res.json())
    //.then(json => json.data.map(o => new Date(o.attributes.departure_time)))
};

