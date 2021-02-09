export AWS_ACCESS_KEY_ID=AKIAZT3HMUS2F46N32WM

update:
	cd lambda/viewer-request-function && zip -FS -q -r ../../dist/viewer-request-function.zip * && \
	cd lambda/origin-response-function && zip -FS -q -r ../../origin-response-function.zip * && \
    aws lambda update-function-code \
        --function-name "OriginResponse" \
        --zip-file "origin-response-function.zip" \
        --publish && \
    aws lambda update-function-code \
        --function-name "ViewerRequest" \
        --zip-file "viewer-request-function.zip" \
		--publish