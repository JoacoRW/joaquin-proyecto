// src/getReservas.js - Obtener reservas existentes
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const jwt = require('jsonwebtoken');

const ddbClient = new DynamoDBClient({ region: "us-east-1" });

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

    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No Authorization header' })
      };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return { 
        statusCode: 401, 
        headers, 
        body: JSON.stringify({ error: 'No token provided' }) 
      };
    }

    // Decodificar token de Cognito
    const decoded = jwt.decode(token);
    if (!decoded) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }

    const clienteId = decoded["custom:clienteId"] || "hospitalA";

    // Obtener query parameters para filtrar por fecha si se proporciona
    const queryParams = event.queryStringParameters || {};
    const fechaInicio = queryParams.fechaInicio;
    const fechaFin = queryParams.fechaFin;

    let params = {
      TableName: "reservas"
    };

    // Si se proporcionan fechas, filtrar por rango
    if (fechaInicio || fechaFin) {
      let filterExpression = "clienteId = :clienteId";
      let expressionAttributeValues = {
        ":clienteId": { S: clienteId }
      };

      if (fechaInicio) {
        filterExpression += " AND fecha >= :fechaInicio";
        expressionAttributeValues[":fechaInicio"] = { S: fechaInicio };
      }

      if (fechaFin) {
        filterExpression += " AND fecha <= :fechaFin";
        expressionAttributeValues[":fechaFin"] = { S: fechaFin };
      }

      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = expressionAttributeValues;
    } else {
      // Sin filtro de fecha, solo por cliente
      params.FilterExpression = "clienteId = :clienteId";
      params.ExpressionAttributeValues = {
        ":clienteId": { S: clienteId }
      };
    }

    const command = new ScanCommand(params);
    const response = await ddbClient.send(command);
    const reservas = response.Items ? response.Items.map(item => unmarshall(item)) : [];

    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        reservas,
        count: reservas.length,
        clienteId: clienteId
      }) 
    };
    
  } catch (error) {
    console.error('Error en getReservas:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};