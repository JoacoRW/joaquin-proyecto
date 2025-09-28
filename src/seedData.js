const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const ddbClient = new DynamoDBClient({ region: "us-east-1" });

module.exports.handler = async () => {
  const items = [
    {
      TableName: "espacios",
      Item: {
        espacioId: { S: "box1" },
        tipoEspacio: { S: "hospital_box" },
        disponible: { BOOL: true },
        clienteId: { S: "hospitalA" },
        descripcion: { S: "Box para pacientes" }
      }
    },
    {
      TableName: "permisos",
      Item: {
        userId: { S: "e4b80488-9051-70d6-d333-5d8340e7915d" },
        clienteId: { S: "hospitalA" },
        permissions: { SS: ["agendar", "ver"] }
      }
    }
  ];

  for (const item of items) {
    const command = new PutItemCommand(item);
    await ddbClient.send(command);
  }

  return { statusCode: 200, body: JSON.stringify({ message: "Datos iniciales cargados" }) };
};