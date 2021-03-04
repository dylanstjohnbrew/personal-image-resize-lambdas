#export AWS_ACCESS_KEY_ID=
#export AWS_SECRET_ACCESS_KEY=

# NEED TO UPDATE CLOUDFRONT CONFIGURATION TO THE LATEST PUBLISHED VERSION. (CLOUDFRONT - BEHAVIORS - EDIT LAMBDA ASSOCIATIONS) $LATEST WILL NOT WORK.
update:
	cd lambda/viewer-request-function/ && zip -FS -q -r ../../viewer-request-function.zip * && cd ../../ && \
	cd lambda/origin-response-function/ && zip -FS -q -r ../../origin-response-function.zip * && cd ../../ && \
    aws lambda update-function-code \
		--region us-east-1 \
        --function-name arn:aws:lambda:us-east-1:337092305556:function:OriginResponse \
        --zip-file fileb://origin-response-function.zip \
        --publish && \
    aws lambda update-function-code \
		--region us-east-1 \
        --function-name arn:aws:lambda:us-east-1:337092305556:function:ViewerRequest \
        --zip-file fileb://viewer-request-function.zip \
		--publish