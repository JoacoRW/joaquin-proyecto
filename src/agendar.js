// src/agendar.js - Agendar un espacio (FIXED VERSION)
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const jwt = require('jsonwebtoken');
// Use crypto.randomUUID instead of uuid package
const crypto = require('crypto');

const ddbClient = new DynamoDBClient({ region: "us-east-1" });

module.exports.handler = async (event) => {
  console.log('=== Agendar Handler FIXED ===');
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // NO manejamos CORS manualmente - dejamos que serverless.yml lo haga

    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log("Authorization header:", authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log("ERROR: No Authorization header");
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No Authorization header' })
      };
    }

    const token = authHeader.split(' ')[1];
    console.log("Token extracted:", token ? `${token.length} characters` : 'null');
    
    if (!token) {
      console.log("ERROR: No token in Authorization header");
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: 'No token provided' }) 
      };
    }

    // Para tokens de Cognito, decodificar sin verificar firma
    let decoded;
    try {
      decoded = jwt.decode(token);
      console.log("Token decoded successfully:", decoded?.sub);
    } catch (decodeError) {
      console.log("ERROR decoding token:", decodeError.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'Token decode failed',
          debug: decodeError.message
        })
      };
    }
    
    if (!decoded || !decoded.sub) {
      console.log("Error: Invalid token content");
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'Invalid token format'
        })
      };
    }

    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.log("Error: Token expired", { exp: decoded.exp, now: now });
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }

    const userId = decoded.sub;
    const clienteId = decoded["custom:clienteId"] || "hospitalA";
    console.log("User and client extracted:", { userId, clienteId });
    
    const body = JSON.parse(event.body || '{}');
    const { espacioId, fecha, horaInicio, horaFin } = body;
    console.log("Reservation data received:", { espacioId, fecha, horaInicio, horaFin });

    // Validar parámetros requeridos
    if (!espacioId || !fecha) {
      console.log("ERROR: Missing required parameters");
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'espacioId y fecha son requeridos',
          received: { espacioId, fecha, horaInicio, horaFin }
        })
      };
    }

    const reservaId = crypto.randomUUID();
    console.log("Creating reservation with ID:", reservaId);

    // Crear reserva con todos los campos
    const params = {
      TableName: "reservas",
      Item: {
        reservaId: { S: reservaId },
        fecha: { S: fecha },
        espacioId: { S: espacioId },
        userId: { S: userId },
        clienteId: { S: clienteId },
        horaInicio: { S: horaInicio || "N/A" },
        horaFin: { S: horaFin || "N/A" },
        estado: { S: "reservado" },
        createdAt: { S: new Date().toISOString() }
      }
    };

    console.log("DynamoDB parameters:", JSON.stringify(params, null, 2));

    const command = new PutItemCommand(params);
    const result = await ddbClient.send(command);
    
    console.log("DynamoDB result:", result);
    console.log("Reservation created successfully with ID:", reservaId);

    return { 
      statusCode: 201,
      body: JSON.stringify({ 
        message: "Reserva creada exitosamente",
        reservaId: reservaId,
        espacioId: espacioId,
        fecha: fecha,
        horaInicio: horaInicio,
        horaFin: horaFin
      }) 
    };
  } catch (error) {
    console.error('Error in agendar:', error);
    return { 
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }) 
    };
  }
};