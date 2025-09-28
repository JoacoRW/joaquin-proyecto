const { CognitoIdentityProviderClient, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require("crypto");

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
const clientId = "733ge1se4vd27vfm28mj4d1h27"; // Tu App Client ID
const clientSecret = "s40pv0canm51i6bqns4bk71gvc8662pjmf5410l9o53eidj8hhf"; // Reemplaza con el Client Secret de Cognito

function calculateSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(message);
  return hmac.digest("base64");
}

async function login(username, password) {
  const secretHash = calculateSecretHash(username, clientId, clientSecret);
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash
    }
  };
  const command = new InitiateAuthCommand(params);
  const response = await client.send(command);
  return response.AuthenticationResult;
}

module.exports.handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }
    const authResult = await login(username, password);
    const idToken = authResult.IdToken;
    return {
      statusCode: 200,
      body: JSON.stringify({ token: idToken, user: { sub: 'mock-user' } })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Login failed: ' + error.message })
    };
  }
};