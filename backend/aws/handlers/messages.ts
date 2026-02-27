import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { validateMessageContent } from '../../../shared/validation/message';
import { logError } from '../../../shared/utils/logger';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'q-social-messages';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function createMessage(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Request body is required',
          code: 'VALIDATION_ERROR'
        })
      };
    }
    
    const { content } = JSON.parse(event.body);
    
    const validation = validateMessageContent(content);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: validation.error,
          code: 'VALIDATION_ERROR'
        })
      };
    }
    
    const message = {
      id: uuidv4(),
      content: content.trim(),
      createdAt: Date.now()
    };
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: message
    }));
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message })
    };
  } catch (error) {
    logError('Error creating message', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      })
    };
  }
}

export async function getMessages(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));
    
    const messages = (result.Items || []).sort((a, b) => b.createdAt - a.createdAt);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ messages })
    };
  } catch (error) {
    logError('Error retrieving messages', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      })
    };
  }
}
