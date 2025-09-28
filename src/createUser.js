const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
const userPoolId = "us-east-1_qVjKBhjDp"; // Reemplaza con el ID de tu User Pool (e.g., us-east-1_abc123)

module.exports.handler = async (event) => {
  try {
    const { username, password, email } = JSON.parse(event.body || '{}');
    if (!username || !password || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username, password, and email are required' })
      };
    }

    const params = {
      UserPoolId: userPoolId,
      Username: username,
      TemporaryPassword: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email
        },
        {
          Name: "email_verified",
          Value: "true" // Opcional: Marca el email como verificado
        }
      ],
      MessageAction: "SUPPRESS" // Evita enviar un correo de invitación; usa la contraseña proporcionada
    };

    const command = new AdminCreateUserCommand(params);
    const response = await client.send(command);
    console.log("User created:", JSON.stringify(response));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: `User ${username} created successfully`, user: response.User })
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Failed to create user: ' + error.message })
    };
  }
};