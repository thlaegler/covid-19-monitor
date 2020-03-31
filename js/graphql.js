var connections = {};
const GQL = {
    CONNECTION_INIT: 'connection_init',
    CONNECTION_ACK: 'connection_ack',
    CONNECTION_ERROR: 'connection_error',
    CONNECTION_KEEP_ALIVE: 'ka',
    START: 'start',
    STOP: 'stop',
    CONNECTION_TERMINATE: 'connection_terminate',
    DATA: 'data',
    ERROR: 'error',
    COMPLETE: 'complete',
};

const queryCountryDetailsMini = () => {
    return `query($request: AbstractRequestInput) {
        countryDetails(request: $request) {
            id
            countryRegion
        }
    }`;
};
const queryDateIdsMini = () => {
    return `query($request: AbstractRequestInput) {
        countryDateSnapshots(request: $request) {
            dateId
            importDate
        }
    }`;
};
const queryCountryDateSnapshots = (confirmed = false, recovered = false, death = false) => {
    return `query($request: AbstractRequestInput) {
    countryDateSnapshots(request: $request) {
        id
        dateId
        countryRegion
        provinceState
        recoveryRate
        mortalityRate
        incidencePer100k
        immunizationRate ` + ((confirmed) ?
            `confirmed {
            value
            value24HoursAgo
            value7DaysAgo
            delta24Hours
            delta7Days
            growthRateLast24Hours
            growthRateLast7Days
        } ` : '') + ((recovered) ?
            `recovered {
            value
            value24HoursAgo
            value7DaysAgo
            delta24Hours
            delta7Days
            growthRateLast24Hours
            growthRateLast7Days
        } ` : '') + ((death) ?
            `death {
            value
            value24HoursAgo
            value7DaysAgo
            delta24Hours
            delta7Days
            growthRateLast24Hours
            growthRateLast7Days
        } ` : '') +
        `importDate
        source
    }
    countryDetails(request: $request) {
        id
        countryRegion
        alternativeName
        provinceState
        countryCode
        populationAbsolute
        migrants
        populationMedianAge
        populationNetChange
        populationYearlyChange
        populationOver65
        populationOver65Ratio
        urbanPopulation
        populationWorldShare
        landArea
        populationDensity
        fertilityRate
        gdpAbsolute
        gdpPerCapita
        healthExpenditureOfGdp
        healthExpenditurePerCapita
        acuteCareBeds
        acuteCareBedsPer100k
        criticalCareBeds
        criticalCareBedsPer100k
        criticalCareAcuteCareBedRatio
        importDate
        source
        location {
        lat
        lon
        }
    }
}`;
};

const queryGraphQl = async (queryName, variables = {}, onMessage) => {
    console.log('GraphQl Query ', queryName);
    return queryOrMutateGraphQl(queryName, settings.graphQlQuery[queryName], variables, onMessage, $('#inputBaseUrl').val(), '?api_key=' + settings.apiKey + '&app_id=' + settings.appId);
};

const mutateGraphQl = (queryName, variables = {}, onMessage) => {
    console.log('GraphQl Query ', queryName);
    return queryOrMutateGraphQl(queryName, settings.graphQlMutation[queryName], variables, r => console.log('GraphQL Mutation successfully finished: ', r), $('#inputBaseUrl').val(), '?api_key=' + settings.apiKey + '&app_id=' + settings.appId);
};

const queryOrMutateGraphQl = async (queryName, query, variables = {}, onMessage, baseUrl, queryString = '') => {
    fetch(baseUrl + '/graphql' + queryString, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-app-id': 'showcase',
            'x-api-key': 'test',
        },
        body: JSON.stringify({
            query: query,
            variables: variables,
        })
    }).then(r => r.json())
        .then(messages => {
            if (messages && messages.data) {
                if (queryName) {
                    var result = messages.data[queryName];
                    console.log(result);
                    onMessage(result);
                } else {
                    onMessage(messages.data);
                }
            } else {
                $('.loader-container').hide();
                console.error('No result data from graphql ', queryName, query);
            }
        }).catch(err => console.error('GraphQL Query failed ', err));
};

const subscribeGraphQl = (queryName, variables = {}, onMessage) => {
    subscribeGraphQlInternal(queryName, settings.graphQlSubscription[queryName], variables, onMessage, $('#inputBaseUrl').val(), '?api_key=' + settings.apiKey + '&app_id=' + settings.appId);
};

const subscribeGraphQlInternal = (queryName, query, variables = {}, onMessage, baseUrl, queryString = '') => {
    console.log('GraphQl Subscription ', queryName);

    unsubscribeGraphQl(queryName);

    var ws = new WebSocket(baseUrl.replace('http', 'ws') + '/graphql/subscriptions' + queryString, ['graphql-ws']);

    ws.onopen = (event) => {
        console.log('GraphQl Subscription starting query ', query, event);
        ws.send(JSON.stringify({ type: GQL.CONNECTION_INIT, payload: {} }));
        ws.send(JSON.stringify({
            id: '1',
            type: GQL.START,
            payload: {
                query: query,
                variables: variables,
                operationName: null,
                extensions: {},
            }
        }));
        console.log('GraphQl Subscription started ...');
        $('#activeSubscriptionIcon').attr('src', 'images/icon_active.gif');
    };

    ws.onmessage = (message) => {
        var data = JSON.parse(message.data);
        if (data.type == GQL.CONNECTION_ACK) {
            console.log('GraphQl Subscription established: ', data);
        } else if (data.type == GQL.CONNECTION_KEEP_ALIVE) {
            // console.log('GraphQl Subscription idle/listening: ', data);
        } else if (data.type == GQL.DATA) {
            console.log('GraphQl Subscription message received');
            if (onMessage) {
                onMessage(data.payload.data[queryName]);
            }
        } else if (data.type == GQL.ERROR) {
            console.error('GraphQl Subscription received error: ', data);
        } else {
            console.error('GraphQl Subscription received unknown message type ', data.type);
        }
    };

    ws.onclose = () => {
        console.log('GraphQl Subscription closed');
        $('#activeSubscriptionIcon').attr('src', 'images/icon_inactive.gif');
    };

    // setTimeout(unsubscribeGraphQl(ws), 60000); // Auto disconnect after 60 seconds
    connections[queryName] = ws;
    return ws;
}

const unsubscribeGraphQl = (queryName = null) => {
    if (queryName && connections[queryName]) {
        connections[queryName].send(JSON.stringify({ id: 1, type: GQL.STOP }));
        connections[queryName].close();
        delete connections[queryName];
    } else {
        // Close all connections
        Object.values(connections).forEach(c => {
            c.send(JSON.stringify({ id: 1, type: GQL.STOP }));
            c.close();
        });
        connections = [];
    }
    $('#activeSubscriptionIcon').attr('src', 'images/icon_inactive.gif');
};