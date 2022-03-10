var main = require('../index');

var event = {
    queryStringParameters: {
        currency : 'EUR/JPY'
    }
};

main.handler(event, null);