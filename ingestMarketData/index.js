
const AWS = require('aws-sdk');
const csv = require('csvtojson');

//Services initialization
AWS.config.update({ region: 'eu-west-1' });
const S3 = new AWS.S3();
const ddb = new AWS.DynamoDB.DocumentClient();

//Model
const Price = require('./models/price.model.js')

exports.handler = async (event, context) => {

    //Save bucket and file name
    let bucket_name;
    let file_name;

    event.Records.forEach((record) => {
        bucket_name = record.s3.bucket.name;
        file_name = record.s3.object.key;
    });

    //Get file from bucket and transform to JSON
    const params = { Bucket: bucket_name, Key: file_name }
    const dataJSON = await csvToJSON(params);
    const validatedPrices = await mapModelValidationData(dataJSON);

    //Push prices objects to AWS DynamoDB
    pushToDynamoDB(validatedPrices);

    // validatedPrices.forEach((price) => {
    //     try {
    //         pushToDynamoDB(price);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // });

    return {
        statusCode: 201,
        response: validatedPrices
    };
};


/**
 * 
 * @param {*} params S3 params required to reach the object: Bucket, Key
 * @description Receive params, search file in S3 and transform it to JSON.
 * @returns Array of documents, one document per csv line.
 */
async function csvToJSON(params) {
    const stream = S3.getObject(params).createReadStream();
    const csv_props = { noheader: true, headers: ['id', 'currency', 'bid', 'ask', 'ts'] };
    const dataJSON = await csv(csv_props).fromStream(stream);

    return dataJSON;
}


/**
 * 
 * @param {*} dataJSON Input data in JSON format
 * @description Pass the document trough Price model to do data validation and adapt it. 
 * @returns Array of documents with Price model validation checked
 */
async function mapModelValidationData(dataJSON) {

    const validatedPrices = dataJSON.map((p) => {
        let valPrice = new Price({
            data_id: p.id,
            ts: p.ts,
            currency: p.currency,
            bid: p.bid,
            ask: p.ask
        });

        return valPrice.toObject();
    });

    return validatedPrices;
}

async function pushToDynamoDB(prices) {

    //Create the params structure for batchWrite
    let pricesToPush = [];
    prices.forEach((p) => {
        pricesToPush.push({
            PutRequest: {
                Item: {
                    currency: p.currency,
                    data_id: p.data_id,
                    ask: p.ask,
                    bid: p.bid,
                    ts: p.ts
                }
            }
        })
    })

    const params = {
        RequestItems: {
            'fx_market_prices': pricesToPush,
        }
    };

    const data = await
        ddb.batchWrite(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log(JSON.stringify(data, null, 2));
                console.log("Prices saved!");
            }
        });

    return data;

}