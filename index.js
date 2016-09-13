const rp = require('request-promise'),
  _ = require('lodash');

module.exports = {
  getForServer: function (baseUrl, config) {
    const defaultHeaders = {};
    if (['undefined', 'object'].indexOf(typeof config) === -1) {
      throw new Error('Please provide a config object or no config at all');
    }
    if (config.basicAuth) {
      defaultHeaders.authorization = ['Basic', config.basicAuth].join(' ');
    }
    function extendBaseRequest(url, obj, headers) {
      const conf = _.extend({
        url: baseUrl + url,
        json: true,
        resolveWithFullResponse: true
      }, obj || {});
      conf.headers = _.extend({}, defaultHeaders, conf.headers, headers || {})
      return conf;
    }

    function createPutOrPost(verb) {
      return function (url, data, config) {
        var request = extendBaseRequest(url, {
          body: data
        }, config && config.headers);
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
