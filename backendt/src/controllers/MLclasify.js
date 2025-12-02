const { SageMakerRuntimeClient, InvokeEndpointCommand } = require("@aws-sdk/client-sagemaker-runtime");
require('dotenv').config();
const client = new SageMakerRuntimeClient({ 
    region: process.env.AWS_REGION, 
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,     
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY  
    }
});
exports.classifyEmail = async (emailText) => {
  try {
    const payload = {
      instances: [emailText]
    };

    const command = new InvokeEndpointCommand({
      EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME, 
      ContentType: "application/json",
      Body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const responseBody = new TextDecoder("utf-8").decode(response.Body);
    const result = JSON.parse(responseBody);
    
    return result[0]; 

  } catch (error) {
    console.error("SageMaker Error:", error);
    return null; 
  }
};