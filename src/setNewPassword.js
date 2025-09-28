const {
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({});

/**
 * POST /setNewPassword
 * Body: { "username": "email@dominio.com", "newPassword": "NuevaPassword123!", "session": "session_token" }
 * Respuesta: { idToken, accessToken, refreshToken, expiresIn }
 */
module.exports.handler = async (event) => {
  try {
    const { username, newPassword, session } = JSON.parse(event.body || "{}");

    if (!username || !newPassword || !session) {
      return response(400, { ok: false, error: "username, newPassword y session son obligatorios" });
    }

    const cmd = new RespondToAuthChallengeCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword
      }
    });

    const out = await client.send(cmd);

    if (out.ChallengeName) {
      return response(403, { ok: false, challenge: out.ChallengeName, session: out.Session });
    }

    const auth = out.AuthenticationResult || {};
    return response(200, {
      ok: true,
      message: "Contraseña actualizada exitosamente",
      idToken: auth.IdToken,
      accessToken: auth.AccessToken,
      refreshToken: auth.RefreshToken,
      expiresIn: auth.ExpiresIn
    });
  } catch (err) {
    console.error("SetNewPassword error:", err);
    
    let errorMessage = "Error al establecer nueva contraseña";
    let statusCode = 400;
    
    if (err.name === 'InvalidPasswordException') {
      errorMessage = "La contraseña no cumple los requisitos de política";
    } else if (err.name === 'InvalidParameterException') {
      errorMessage = "Parámetros inválidos";
    } else if (err.name === 'ExpiredCodeException') {
      errorMessage = "La sesión ha expirado. Inicie sesión nuevamente";
      statusCode = 401;
    }
    
    return response(statusCode, { ok: false, error: errorMessage, details: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify(body)
  };
}