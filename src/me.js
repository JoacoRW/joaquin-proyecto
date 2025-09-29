/**
 * Versión simplificada del endpoint /me para debugging
 */
module.exports.me = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  console.log("=== DEBUGGING ENDPOINT /me ===");
  console.log("Event completo:", JSON.stringify(event, null, 2));
  console.log("Headers:", event.headers);
  
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    console.log("Authorization header:", authHeader);
    
    if (!authHeader) {
      console.log("ERROR: No Authorization header");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'No Authorization header',
          debug: 'Authorization header missing'
        })
      };
    }

    const token = authHeader.split(' ')[1];
    console.log("Token extraído:", token ? `${token.length} characters` : 'null');
    
    if (!token) {
      console.log("ERROR: No token in Authorization header");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'No token provided',
          debug: 'Token missing from Authorization Bearer'
        })
      };
    }

    // Intentar decodificar el token
    const jwt = require('jsonwebtoken');
    let claims;
    
    try {
      claims = jwt.decode(token);
      console.log("Token decodificado exitosamente:", claims);
    } catch (decodeError) {
      console.log("ERROR al decodificar token:", decodeError.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Token decode failed',
          debug: decodeError.message
        })
      };
    }
    
    if (!claims) {
      console.log("ERROR: Claims vacías después de decodificar");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid token format',
          debug: 'jwt.decode returned null'
        })
      };
    }

    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    console.log("Verificando expiración:", { exp: claims.exp, now: now, diff: claims.exp - now });
    
    if (claims.exp && claims.exp < now) {
      console.log("ERROR: Token expirado");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Token expired',
          debug: `Token expired ${now - claims.exp} seconds ago`
        })
      };
    }

    console.log("Token válido, enviando respuesta exitosa");
    
    // Respuesta exitosa
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        sub: claims.sub,
        email: claims.email,
        username: claims["cognito:username"] || claims.username || 'N/A',
        groups: claims["cognito:groups"] || [],
        tokenType: claims.token_use,
        clientId: claims.client_id,
        exp: claims.exp,
        timeToExpiry: claims.exp ? claims.exp - now : 'N/A',
        allClaims: claims
      })
    };
    
  } catch (error) {
    console.error('ERROR general en /me:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        debug: error.message
      })
    };
  }
};