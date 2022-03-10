const AWS = require('aws-sdk');

//Services initialization
AWS.config.update({ region: 'eu-west-1' });
const ddb = new AWS.DynamoDB.DocumentClient();

const errorLiterals = {
    invalidParams: 'Invalid parameters. Check request parameters'
}

exports.handler = async (event, context) => {
    try {
        const currencyParam = event['queryStringParameters']['currency'];
        const currenciesEnum = ['EUR/USD', 'GBP/USD', 'EUR/JPY'];

        //Param validation
        const isValidParam = currenciesEnum.includes(currencyParam);

        if (isValidParam) {

            //Request for last price in DB
            const lastPriceRes = await getLastPriceByCurrency(currencyParam);

            //Send response
            const response = {
                statusCode: 200,
                body: JSON.stringify(lastPriceRes),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            }

            return response;
        } else {
            return errorResponse(422, errorLiterals.invalidParams);
        }
    } catch (err) {
        console.log(`EXECUTION FAILS, WITH ERROR: ${err}`);
        if (context) {
            errorResponse(err, context.awsRequestId);
        } else {
            errorResponse(500, err, "null");
        }
    }
}

async function getLastPriceByCurrency(currency) {

    try {
        var params = {
            TableName: "fx_market_prices",
            IndexName: "currency-ts-index",
            KeyConditionExpression: "#currency =:currency",
            ExpressionAttributeNames: {
                "#currency": "currency"
            },
            ExpressionAttributeValues: {
                ":currency": currency
            },
            ProjectionExpression: "currency, ask, ts",
            ScanIndexForward: true
        };

        return new Promise((res, rej) => {
            ddb.query(params, function (err, data) {
                if (err) {
                    console.log(err);
                    rej(err);
                } else {
                    const latestPrice = {
                        currency: data.Items[data.Items.length - 1].currency,
                        price: data.Items[data.Items.length - 1].ask
                    };
                    console.log('Latest price returned: ', latestPrice);

                    res(latestPrice);
                }
            });
        });

    } catch (err) {
        console.log(err);
        return err;
    }

}



function errorResponse(codError, error, awsRequestId) {
    return {
        statusCode: codError,
        body: JSON.stringify({
            errorMessage: error.message,
            errorCode: error.code || '-1',
            reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
}