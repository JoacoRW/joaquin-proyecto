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

  console.log("=== DEBUGGING ENDPOINT /listSpaces ===");
  console.log("Event headers:", event.headers);

  try {
    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log("Authorization header en listSpaces:", authHeader);
    
    if (!authHeader) {
      console.log("ERROR: No Authorization header en listSpaces");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'No Authorization header',
          debug: 'listSpaces: Authorization header missing'
        })
      };
    }

    const token = authHeader.split(' ')[1];
    console.log("Token extraído en listSpaces:", token ? `${token.length} characters` : 'null');
    
    if (!token) {
      console.log("ERROR: No token en Authorization header listSpaces");
      return { 
        statusCode: 401, 
        headers, 
        body: JSON.stringify({ 
          error: 'No token provided',
          debug: 'listSpaces: Token missing from Authorization Bearer'
        }) 
      };
    }

    // Para tokens de Cognito, decodificar sin verificar firma
    console.log("Token recibido en listSpaces (primeros 50 chars):", token.substring(0, 50));
    
    let decoded;
    try {
      decoded = jwt.decode(token);
      console.log("Token decodificado en listSpaces exitosamente:", decoded);
    } catch (decodeError) {
      console.log("ERROR al decodificar token en listSpaces:", decodeError.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Token decode failed',
          debug: `listSpaces: ${decodeError.message}`
        })
      };
    }
    
    if (!decoded) {
      console.log("Error: Token decodificado es null en listSpaces");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid token format',
          debug: 'listSpaces: jwt.decode returned null'
        })
      };
    }
    
    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    console.log("Verificando expiración en listSpaces:", { exp: decoded.exp, now: now, diff: decoded.exp - now });
    
    if (decoded.exp && decoded.exp < now) {
      console.log("Error: Token expirado en listSpaces", { exp: decoded.exp, now: now });
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }
    
    const clienteId = decoded["custom:clienteId"] || "hospitalA";
    console.log("ClienteId extraído:", clienteId);
    console.log("Token válido en listSpaces, consultando DynamoDB...");

    // Usar ScanCommand para obtener todos los espacios y filtrar por clienteId
    const params = {
      TableName: "espacios",
      FilterExpression: "clienteId = :clienteId AND disponible = :disponible",
      ExpressionAttributeValues: {
        ":clienteId": { S: clienteId },
        ":disponible": { BOOL: true }
      }
    };

    console.log("Parámetros de consulta DynamoDB:", params);
    
    const command = new ScanCommand(params);
    const response = await ddbClient.send(command);
    
    console.log("Respuesta de DynamoDB:", response);
    console.log("Items encontrados:", response.Items?.length || 0);
    
    const spaces = response.Items ? response.Items.map(item => unmarshall(item)) : [];
    console.log("Espacios procesados:", spaces);

    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        spaces,
        count: spaces.length,
        clienteId: clienteId,
        debug: "listSpaces ejecutado exitosamente"
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