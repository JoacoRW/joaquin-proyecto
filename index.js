exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: '¡Hola desde Serverless Framework!',
        input: event,
      },
      null,
      2
    ),
  };
};