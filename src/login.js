const { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require("crypto");

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
const clientId = "733ge1se4vd27vfm28mj4d1h27";
const clientSecret = "s40pv0canm51i6bqns4bk71gvc8662pjmf5410l9o53eidj8hhf"; // Tu Client Secret

function calculateSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(message);
  return hmac.digest("base64");
}

async function login(username, password, newPassword = null, nickname = null) {
  const secretHash = calculateSecretHash(username, clientId, clientSecret);
  let params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash
    }
  };
  let command = new InitiateAuthCommand(params);
  let response = await client.send(command);
  console.log("Initial Cognito response:", JSON.stringify(response));

  if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    const challengeResponses = {
      USERNAME: username,
      NEW_PASSWORD: newPassword || password,
      SECRET_HASH: secretHash,
      nickname: nickname || username
    };
    params = {
      ClientId: clientId,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: response.Session,
      ChallengeResponses: challengeResponses
    };
    command = new RespondToAuthChallengeCommand(params);
    response = await client.send(command);
    console.log("Challenge response:", JSON.stringify(response));
  }

  return response.AuthenticationResult;
}

module.exports.handler = async (event) => {
  try {
    const { username, password, newPassword, nickname } = JSON.parse(event.body || '{}');
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }
    const authResult = await login(username, password, newPassword, nickname);
    if (!authResult || !authResult.IdToken) {
      throw new Error("Authentication failed: No IdToken received");
    }
    const idToken = authResult.IdToken;
    // Extraer atributos del usuario desde el token (decodificación básica, no segura para producción)
    const user = {
      sub: authResult.IdToken.split('.')[1], // Decodificación aproximada, usa una librería como jwt-decode en producción
      username: username
    };
    return {
      statusCode: 200,
      body: JSON.stringify({ token: idToken, user: user })
    };
  } catch (error) {
    console.error("Error details:", error);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Login failed: ' + error.message })
    };
  }
};