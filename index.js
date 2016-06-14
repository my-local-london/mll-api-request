const rp = require('request-promise'),
  _ = require('lodash');

module.exports = {
  getForServer: function (baseUrl, config) {
    const defaultHeaders = {};
    if (config.basicAuth) {
      defaultHeaders.authorization = ['Basic', config.basicAuth].join(' ');
    }
    function extendBaseRequest(url, obj, headers) {
      return _.extend({
        url: baseUrl + url,
        json: true,
        resolveWithFullResponse: true,
        headers: _.extend({}, defaultHeaders, headers || {})
      }, obj || {});
    }

    function createPutOrPost(verb) {
      return function (url, data, config) {
        var request = extendBaseRequest(url, {
          body: data
        });
        if (config && config.unauthenticated) {
          delete request.headers.authorization;
        }
        return rp[verb](request);
      }
    }

    function get(url, config, headers) {
      var request = extendBaseRequest(url, config, headers);
      if (config && config.unauthenticated) {
        delete request.headers.authorization;
      }
      return rp.get(request);
    }

    return {
      get: get,
      put: createPutOrPost('put'),
      post: createPutOrPost('post')
    };
  }
};