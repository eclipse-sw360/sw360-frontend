# Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
# Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/

# SPDX-License-Identifier: EPL-2.0
# License-Filename: LICENSE

option="$1"

COUCHDB_IP=$(jq -r '.couchdb_ip' ./cypress.env.json)
COUCHDB_PORT=$(jq -r '.couchdb_port' ./cypress.env.json)
DB_NAME=$(jq -r '.couchdb_dbname' ./cypress.env.json)
COUCHDB_USERNAME=$(jq -r '.couchdb_username' ./cypress.env.json)
COUCHDB_PASSWORD=$(jq -r '.couchdb_password' ./cypress.env.json)
USER_DB_NAME=$(jq -r '.couchdb_users_dbname' ./cypress.env.json)
OAUTH_DB_NAME=$(jq -r '.couchdb_oauth_clients_dbname' ./cypress.env.json)

delete_all_components() {
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/_find" -H "Content-Type: application/json" -d '{
        "selector": {
            "type": "component"
        },
        "fields": ["_id", "_rev"],
        "limit": 100
        }' | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

delete_all_releases() {
 curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/_find" -H "Content-Type: application/json" -d '{
        "selector": {
            "type": "release"
        },
        "fields": ["_id", "_rev"],
        "limit": 100
        }' | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

delete_all_projects() {
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/_find" -H "Content-Type: application/json" -d '{
        "selector": {
            "type": "project"
        },
        "fields": ["_id", "_rev"],
        "limit": 100
        }' | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

delete_all_licenses() {
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/_find" -H "Content-Type: application/json" -d '{
        "selector": {
            "type": "license"
        },
        "fields": ["_id", "_rev"],
        "limit": 100
        }' | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

create_license() {
    shortname="$1"
    JSON_DATA="
        {
            \"_id\": \"$shortname\",
            \"type\": \"license\",
            \"shortname\": \"$shortname\",
            \"fullname\": \"Attribution Assurance License\",
            \"externalLicenseLink\": \"https://spdx.org/licenses/$shortname.html\",
            \"externalIds\": {
                \"SPDX-License-Identifier\": \"$shortname\"
            },
            \"OSIApproved\": \"YES\",
            \"FSFLibre\": \"NA\",
            \"obligationDatabaseIds\": [],
            \"text\": \"text\",
            \"checked\": true,
            \"issetBitfield\": \"0\"
        }
    "

    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA"
}

delete_license_by_short_name() {
    shortname="$1"
    revision=$(curl -sX GET "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/$shortname" | jq -r '._rev')
    curl -X DELETE "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/$shortname?rev=$revision"
}

create_vendor() {
    shortname1="$1"
    JSON_DATA="
    {
        \"type\": \"vendor\",
        \"shortname\": \"$shortname1\",
        \"fullname\": \"$shortname1\",
        \"url\": \"http://localhost:8080/$shortname1\"
    }
    "

    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA"
}

delete_all_vendors() {
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/_find" -H "Content-Type: application/json" -d '{
        "selector": {
            "type": "vendor"
        },
        "fields": ["_id", "_rev"],
        "limit": 100
        }' | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

create_user() {
    email="$1"
    givename="$2"
    lastname="$3"
    usergroup="$4"
    JSON_DATA="
        {
            \"type\": \"user\",
            \"email\": \"$email\",
            \"userGroup\": \"$usergroup\",
            \"externalid\": \"sw360$givename\",
            \"fullname\": \"$givename $lastname\",
            \"givenname\": \"$givename\",
            \"lastname\": \"$lastname\",
            \"department\": \"DEPARTMENT1\",
            \"wantsMailNotification\": false,
            \"deactivated\": false,
            \"issetBitfield\": \"1\",
            \"password\": \"\$2a\$10\$KcGk3lFG1JkS05sCt1TtaeLy11Xy8HNUkn7JvD2Nsqikhdqn8dLaq\"
        }
    "

    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$USER_DB_NAME" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA"
}

delete_user_by_email() {
    email="$1"
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$USER_DB_NAME/_find" -H "Content-Type: application/json" -d "{
            \"selector\": {
                \"email\": \"$email\"
            },
            \"fields\": [\"_id\", \"_rev\"],
            \"limit\": 10
            }" | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$USER_DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

create_oauth_client() {
    oauth_client_data=$(jq "." "cypress/fixtures/oauth-client.json")
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$OAUTH_DB_NAME" \
        -H "Content-Type: application/json" \
        -d "$oauth_client_data"
}

delete_oauth_client() {
    oauth_client_id=$(jq ".client_id" "cypress/fixtures/oauth-client.json")
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$OAUTH_DB_NAME/_find" -H "Content-Type: application/json" -d "{
        \"selector\": {
            \"client_id\": $oauth_client_id
        },
        \"fields\": [\"_id\", \"_rev\"],
        \"limit\": 1
    }" | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$OAUTH_DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

create_license_type() {
    licensetype="$1"
    JSON_DATA="
        {
            \"type\": \"licenseType\",
            \"licenseType\": \"$licensetype\",
            \"issetBitfield\": \"1\"
        }
    "
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA"
}

delete_all_license_types() {
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/_find" -H "Content-Type: application/json" -d '{
        "selector": {
            "type": "licenseType"
        },
        "fields": ["_id", "_rev"],
        "limit": 100
        }' | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

create_obligation() {
    title="$1"
    text="$2"
    obligationLevel="$3"
    case $3 in
        1) obligationLevel="ORGANISATION_OBLIGATION";;
        2) obligationLevel="COMPONENT_OBLIGATION";;
        3) obligationLevel="PROJECT_OBLIGATION";;
        4) obligationLevel="LICENSE_OBLIGATION";;
        *) echo "Invalid obligation level"; exit 1;;
    esac
    JSON_DATA=$(cat <<EOF
        {
            "type": "obligation",
            "text": "$text",
            "whitelist": [],
            "development": false,
            "distribution": false,
            "title": "$title",
            "obligationLevel": "$obligationLevel",
            "issetBitfield": "0"
        }
EOF
    )
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA"
}

delete_all_obligations() {
    curl -X POST "http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT/$DB_NAME/_find" -H "Content-Type: application/json" -d '{
        "selector": {
            "type": "obligation"
        },
        "fields": ["_id", "_rev"],
        "limit": 100
        }' | jq -r '.docs[] | "curl -X DELETE 'http://$COUCHDB_USERNAME:$COUCHDB_PASSWORD@$COUCHDB_IP:$COUCHDB_PORT'/'$DB_NAME'/" + ._id + "?rev=" + ._rev' | sh
}

# Run function
case $option in
    deleteAllComponents)
        delete_all_components
        ;;

    deleteAllReleases)
        delete_all_releases
        ;;

    deleteAllProjects)
        delete_all_projects
        ;;

    deleteAllLicenses)
        delete_all_licenses
        ;;

    deleteAllLicenseTypes)
        delete_all_license_types
        ;;

    deleteLicenseByShortName)
        delete_license_by_short_name "$2"
        ;;

    createLicense)
        create_license "$2"
        ;;

    createLicenseType)
        create_license_type "$2"
        ;;

    createVendor)
        create_vendor "$2" 
        ;;

    deleteAllVendors)
        delete_all_vendors
        ;;

    createUser)
        create_user "$2" "$3" "$4" "$5"
        ;;

    deleteUserByEmail)
        delete_user_by_email "$2"
        ;;

    createOauthClient)
        create_oauth_client
        ;;

    deleteOauthClient)
        delete_oauth_client "$2"
        ;;

    createObligation)
        create_obligation "$2" "$3" "$4"
        ;;
        
    deleteAllObligations)
        delete_all_obligations
        ;;

    *) ;;
esac