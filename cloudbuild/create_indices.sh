#!/bin/bash


usage() {
    cat <<EOF
NAME
    ${0##*/} This is a workaround since Spring Data Elasticsearch does not create a geo point field correctly

SYNOPSIS
    ${0##*/}

Options:

    For example:
        ./create_indices.sh

RETURN CODES
    Returns 0 on success, 1 if an error occurs.

SEE ALSO
    See the documentation on Confluence for more details, including
    instructions on creating environments.

EOF
}


function recreateIndices() {
	declare -a arr=( \
		"covid19_snapshots" \
		"countries" \
	)
	
	for i in "${arr[@]}"
	do
		deleteIndex "$i"
		sleep 2
		createIndex "$i"
	done
	
}

function createIndex() {
	INDEX_NAME="$1"

	curl -X PUT "http://localhost:9200/$INDEX_NAME" \
	  -H 'content-type: application/json' \
	  -d '{
		"mappings": {
			"properties": {
				"id": {
                    "type": "keyword"
                },
                "dateId": {
                    "type": "keyword"
                },
				"location": {
					"type": "geo_point"
				},
                "lastUpdate": {
                    "type": "date"
                },
                "importDate": {
                    "type": "date"
                },
				"country": {
					"type": "keyword"
				}
			}
		}
	}'
	echo ""
}

function deleteIndex() {
	INDEX_NAME="$1"

	curl -X DELETE "http://localhost:9200/$INDEX_NAME"
	echo ""
}

if [ $# == 0 ] || [ $# == 1 ]; then
	recreateIndices $1
else
    usage
    exit 1
fi