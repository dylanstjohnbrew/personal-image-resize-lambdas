'use strict';

const ResizeRequest = require('./resize-request');

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;

    let resize = new ResizeRequest(request);
    if (resize.isValid()){
        resize.decorateRequest();
    }

    callback(null, request);
};
