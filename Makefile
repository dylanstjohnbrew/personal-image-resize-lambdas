export AWS_ACCESS_KEY_ID=AKIAZT3HMUS2F46N32WM
export S72_ENVIRONMENT=staging
#export S72_ENVIRONMENT=production

update:
	cd lambda/viewer-request-function && zip -FS -q -r ../../dist/viewer-request-function.zip * && \
	cd lambda/origin-response-function && zip -FS -q -r ../../origin-response-function.zip * && \
    aws lambda update-function-code \
        --function-name "asset-lambda-viewer-$(S72_ENVIRONMENT)" \
        --zip-file "origin-response-function.zip" \
        --publish && \
    aws lambda update-function-code \
        --function-name "asset-lambda-origin-$(S72_ENVIRONMENT)" \
        --zip-file "viewer-request-function.zip" \
		--publish