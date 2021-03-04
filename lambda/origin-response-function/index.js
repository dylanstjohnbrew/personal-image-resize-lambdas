'use strict';

const ResizeOperation = require('./resize-response');

exports.handler = (event, context, callback) => {
    const response = event.Records[0].cf.response;
    const request = event.Records[0].cf.request;

    let operation = new ResizeOperation(response, request);
    if (operation.isValid()){
        operation.createResponse();
    }

    callback(null, response);
};