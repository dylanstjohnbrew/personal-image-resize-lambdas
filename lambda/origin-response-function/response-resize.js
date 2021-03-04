const http = require('http');
const https = require('https');

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
});

const Sharp = require('sharp');
// set the S3 and API GW endpoints
const BUCKET = 'image-resizing-test-updatelambda';

const PATH_VALID = /\/(\d+x\d+)\+(\d+x\d+)\//i;;
const EXT_PATTERN = /\.(jpg|jpeg|png|gif|webp)/i;
const IMAGE_NAME = /([^\/]+)$/;

class ResizeResponse {
  constructor(response, request) {
    this.request = request;
    this.response = response;
    this.isValid = () => !!this.defaultSize && !!this.resizeSize && !!this.bucket;

    // check if image needs to be created
    if(response.status != 404 || !response.status) {return response; }

    // check if request exists
    if(!request || !request.uri) {return response.status = 422; }

    // check if contentType is an acceptable format for Sharp
    this.url = request.uri;

    let content = this.url.match(EXT_PATTERN);
    if (!content){return response.status = 422; }

    this.contentType = 'image/' + (content[1]);

    // check if there is a file name for the image
    content = this.url.match(IMAGE_NAME)[0];
    if (content.startsWith('.')) {return response.status = 422; }

    this.imageName = content;
    // check if the uri contains the default and resize sizes
    content = this.url.match(PATH_VALID);
    if (!content) {return response.status = 422; }

    this.pattern = content[0];
    this.defaultSize = '/' + content[1].split('+')[0] + '/';
    this.resizeSize =  '/'+ content[2].split('+')[0] + '/';

    // check custom headers contain the correct bucket name
    this.bucket = BUCKET;
  }

  createResponse(){
    if (!this.isValid()) { return this.response.status = 422; }

    // try to create the new body for the response and put new image into the bucket
    let buffer = this.getBuffer();
    if (!buffer){return this.response.status = 422; }
    else{ if (!this.putS3Object(buffer)){return this.response.status = 422;}}

    this.response.status = 200;
    this.response.body = buffer.toString('base64');
    this.response.bodyEncoding = 'base64';
    this.response.headers['content-type'] = [{ key: 'Content-Type', value: this.contentType }];

    return this.response;
  }

  async getS3Object(){
    let originalKey = this.url.replace(this.pattern, this.defaultSize).substring(1);
    try {
      let file = await S3.getObject({ Bucket: this.bucket, Key: originalKey }).promise();
      return file;
    }
    catch (err){
      console.info(err, 'in getS3Object');
      return this.response.status = 422;
    }
  }

  async getBuffer(){
    let file = this.getS3Object();

    let heightResize = (this.resizeSize.split('x'))[0];
    let widthResize = (this.resizeSize.split('x'))[1];

    if(file.status === 200){
      try{
        let buffer = Sharp(file.Body)
            .resize(widthResize, heightResize)
            .toBuffer();
        return buffer;
      }
      catch(err){
        console.info(err, 'in GetBuffer');
        return this.response.status = 422;
      }
    }
  }

  async putS3Object(buffer){
    if (!buffer){
      try{
        await S3.putObject({
          ACL: 'bucket-owner-full-control',
          Body: buffer,
          Bucket: this.bucket,
          ContentType: contentType,
          CacheControl: 'max-age=31536000',
          Key: this.imageName,
          StorageClass: 'STANDARD'

        }).promise();
      }
      catch(err){
        console.info(err, 'in putS3Object');
        return this.response.status = 422;
      }
    }
  }
}

module.exports = ResizeResponse;