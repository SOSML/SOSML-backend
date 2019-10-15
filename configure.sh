#!/bin/bash
echo "Configuring for branch '${CI_COMMIT_REF_NAME}'"

case ${CI_COMMIT_REF_NAME} in
    exp|dev)
        sharing="false"
        samples="false"
        theme="madoka"
        ;;
    master)
        sharing="true"
        samples="true"
        theme="sayaka"
        ;;
    *)
        echo "Unknown branch. Whatever, I'll just disable everything"
        sharing="false"
        samples="false"
        theme="kyoko"
        ;;
esac

# Write config file of frontend
echo "export const SHARING_ENABLED = ${sharing};" > ./SOSML-frontend/frontend/src/config.tsx
echo "export const SAMPLE_FILES_ENABLED = ${samples};" >> ./SOSML-frontend/frontend/src/config.tsx
echo "export const DEFAULT_THEME = '${theme}';" >> ./SOSML-frontend/frontend/src/config.tsx

# Write current version for backend
echo "module.exports = {" > ./src/version.js
echo "    REF_NAME: \"${CI_OMMIT_REF_NAME}\"," >> ./src/version.js
echo "    COMMIT_SHA: \"`git rev-parse --short HEAD`\"," >> ./src/version.js
echo "    PIPELINE_ID: \"${CI_PIPELINE_ID}\"" >> ./src/version.js
echo "}" >> ./src/version.js

echo "module.exports = {" > ./extra_config.js
echo "    SHARING_ENABLED: ${sharing}," >> ./extra_config.js
echo "    SAMPLE_FILES_ENABLED: ${samples}" >> ./extra_config.js
echo "}" >> ./extra_config.js
