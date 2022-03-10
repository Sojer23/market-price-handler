var main = require('../index');

var event = {
    Records: [
        {
            eventVersion: "2.0",
            eventSource: "aws:s3",
            awsRegion: "eu-west-1",
            eventTime: "1970-01-01T00:00:00.000Z",
            eventName: "ObjectCreated:Put",
            userIdentity: {
                principalId: "EXAMPLE"
            },
            requestParameters: {
                sourceIPAddress: "127.0.0.1"
            },
            responseElements: {
                "x-amz-request-id": "EXAMPLE123456789",
                "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
            },
            s3: {
                s3SchemaVersion: "1.0",
                configurationId: "testConfigRule",
                bucket: {
                    name: "fx-price-feed-data",
                    ownerIdentity: {
                        principalId: "EXAMPLE"
                    },
                    arn: "arn:aws:s3:::fx-price-feed-data"
                },
                object: {
                    key: "input/fx_market_data.csv",
                    size: 1,
                    eTag: "0123456789abcdef0123456789abcdef",
                    sequencer: "0A1B2C3D4E5F678901"
                }
            }
        }
    ]
};

main.handler(event, null);

