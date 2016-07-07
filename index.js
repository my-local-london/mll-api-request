const rp = require('request-promise'),
  _ = require('lodash');

module.exports = {
  getForServer: function (baseUrl, configIn) {
    const defaultHeaders = {},
      config = configIn || {};
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

    function createDeleteOrGet(verb) {
      return function (url, config, headers) {
        var request = extendBaseRequest(url, config, headers);
        if (config && config.unauthenticated) {
          delete request.headers.authorization;
        }
        request.method = verb.toUpperCase();
        return rp(request);
      }
    }

    return {
      get: createDeleteOrGet('get'),
      'delete': createDeleteOrGet('delete'),
      put: createPutOrPost('put'),
      post: createPutOrPost('post')
    };
  }
};
