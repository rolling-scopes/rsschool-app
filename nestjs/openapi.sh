docker run --rm -v "${PWD}/src:/src" -v "${PWD}/../client/src/api:/out" openapitools/openapi-generator-cli generate -i /src/spec.json -g typescript-axios -o /out
