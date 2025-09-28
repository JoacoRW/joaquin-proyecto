// src/agendar.js - Agendar un espacio
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const secret = "s40pv0canm51i6bqns4bk71gvc8662pjmf5410l9o53eidj8hhf";

module.exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
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
    const userId = decoded.sub;
    const clienteId = decoded["custom:clienteId"] || "default";
    
    const body = JSON.parse(event.body || '{}');
    const { espacioId, fecha } = body;

    // Validar parámetros requeridos
    if (!espacioId || !fecha) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'espacioId y fecha son requeridos' })
      };
    }

    // Crear reserva
    const params = {
      TableName: "reservas",
      Item: {
        reservaId: { S: uuid() },
        fecha: { S: fecha },
        espacioId: { S: espacioId },
        userId: { S: userId },
        clienteId: { S: clienteId },
        estado: { S: "reservado" },
        createdAt: { S: new Date().toISOString() }
      }
    };

    const command = new PutItemCommand(params);
    await ddbClient.send(command);

    return { 
      statusCode: 201, 
      headers, 
      body: JSON.stringify({ 
        message: "Reserva creada exitosamente",
        reservaId: params.Item.reservaId.S
      }) 
    };
  } catch (error) {
    console.error('Error en agendar:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};