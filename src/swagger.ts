import { Request, Response, Router } from 'express';
import path from 'path'; // Для коректної роботи зі шляхами
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { configs } from './configs/config';

const swaggerRouter = Router();

try {
  const swaggerSpec = YAML.load(
    path.join(__dirname, '../shop-list.swagger.yaml'),
  );

  if (!swaggerSpec.servers || !Array.isArray(swaggerSpec.servers)) {
    swaggerSpec.servers = [{ url: '' }];
  }

  const host = configs.SWAGGER_HOST || 'http://localhost';
  const port = configs.API_PORT || 3005;

  swaggerSpec.servers[0].url = `${host}:${port}/api`;
  swaggerSpec.servers[0].description = 'Dynamic server URL';

  swaggerRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (error) {
  console.error('Failed to load Swagger spec:', error);
  swaggerRouter.use('/api-docs', (req: Request, res: Response) => {
    res.status(500).send('Swagger documentation is unavailable');
  });
}

export default swaggerRouter;
