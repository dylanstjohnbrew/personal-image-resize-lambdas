export AWS_ACCESS_KEY_ID=AKIAJNZIEEKN6S335A4A
export AWS_SECRET_ACCESS_KEY=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


# NEED TO UPDATE CLOUDFRONT CONFIGURATION TO THE LATEST PUBLISHED VERSION. (CLOUDFRONT - BEHAVIORS - EDIT LAMBDA ASSOCIATIONS) $LATEST WILL NOT WORK.
update-viewer:
	cd lambda/viewer-request-function && zip -FS -q -r ../../viewer-request-function.zip * && cd ../../ && \
    aws lambda update-function-code \
		--function-name arn:aws:lambda:us-east-1:337092305556:function:ViewerRequest \        --zip-file fileb://viewer-request-function.zip \
		--publish | \
	sleep 10 && \
	rm viewer-request-function.zip
update-origin:
	cd lambda/origin-response-function && zip -FS -q -r ../../origin-response-function.zip * && cd ../../ && \
    aws lambda update-function-code \
        --function-name arn:aws:lambda:us-east-1:337092305556:function:OriginResponse \        --zip-file fileb://origin-response-function.zip \
        --publish | \
	sleep 10 && \
	rm origin-response-function.zip