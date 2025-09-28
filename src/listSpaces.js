// src/listSpaces.js - Lista espacios disponibles
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const jwt = require('jsonwebtoken');

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const secret = "s40pv0canm51i6bqns4bk71gvc8662pjmf5410l9o53eidj8hhf";

module.exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  try {
    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { 
        statusCode: 401, 
        headers, 
        body: JSON.stringify({ error: 'No token provided' }) 
      };
    }

    const decoded = jwt.verify(token, secret);
    const clienteId = decoded["custom:clienteId"] || "default";

    // Usar ScanCommand para obtener todos los espacios y filtrar por clienteId
    const params = {
      TableName: "espacios",
      FilterExpression: "clienteId = :clienteId AND disponible = :disponible",
      ExpressionAttributeValues: {
        ":clienteId": { S: clienteId },
        ":disponible": { BOOL: true }
      }
    };

    const command = new ScanCommand(params);
    const response = await ddbClient.send(command);
    const spaces = response.Items ? response.Items.map(item => unmarshall(item)) : [];

    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        spaces,
        count: spaces.length 
      }) 
    };
  } catch (error) {
    console.error('Error en listSpaces:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};