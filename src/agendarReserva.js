// CORS Test turned into real agendar
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ddbClient = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
    console.log('=== CORS Test Real Agendar ===');
    console.log('Method:', event.httpMethod);
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Credentials': 'false',
        'Content-Type': 'application/json'
    };
    
    try {
        // Handle preflight
        if (event.httpMethod === 'OPTIONS') {
            console.log('Handling OPTIONS preflight request');
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'CORS preflight OK' })
            };
        }
        
        console.log('Processing reservation request');
        
        // Extract and validate token
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'No authorization header' })
            };
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'No token provided' })
            };
        }
        
        // Decode token
        let decoded;
        try {
            decoded = jwt.decode(token);
        } catch (error) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }
        
        if (!decoded || !decoded.sub) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Invalid token content' })
            };
        }
        
        const userId = decoded.sub;
        const clienteId = decoded["custom:clienteId"] || "hospitalA";
        
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { espacioId, fecha, horaInicio, horaFin } = body;
        
        if (!espacioId || !fecha) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }
        
        // Create reservation
        const reservaId = crypto.randomUUID();
        
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
        
        console.log('Creating reservation:', reservaId);
        
        const command = new PutItemCommand(params);
        await ddbClient.send(command);
        
        console.log('Reservation created successfully');
        
        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({ 
                message: 'Reserva creada exitosamente',
                reservaId: reservaId,
                espacioId: espacioId,
                fecha: fecha,
                horaInicio: horaInicio,
                horaFin: horaFin
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};