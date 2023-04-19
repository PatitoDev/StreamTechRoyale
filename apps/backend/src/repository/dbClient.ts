import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import SECRETS from '@streamtechroyale/secrets';

const region = 'eu-west-2';
const internalClient = new DynamoDBClient({ region, credentials: {
    accessKeyId: SECRETS.aws.key,
    secretAccessKey: SECRETS.aws.secretKey, 
} });

const marshallOptions = {
    convertEmptyValues: true, // false, by default.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
};

const unmarshalledOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default. // TODO - check if this works for us
};

const client = DynamoDBDocument.from(internalClient, { marshallOptions, unmarshallOptions: unmarshalledOptions });

export default client;

