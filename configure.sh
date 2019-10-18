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
