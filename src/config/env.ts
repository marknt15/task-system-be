import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${env}` });

export const config = {
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  dynamoDbTable: process.env.DYNAMODB_TABLE,
};