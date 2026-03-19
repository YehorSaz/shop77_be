import { NextFunction, Request, Response, Router } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerRouter = Router();

try {
  const swaggerSpec = YAML.load(
    path.join(__dirname, '../shop-list.swagger.yaml'),
  );

  // Видаляємо жорстко прописані сервери
  if (swaggerSpec.servers) {
    delete swaggerSpec.servers;
  }

  // Роут для віддачі динамічного JSON
  swaggerRouter.get('/api-docs/swagger.json', (req: Request, res: Response) => {
    const requestHost = req.get('host');
    const protocol = requestHost?.includes('ngrok-free.dev') ? 'https' : 'http';

    const dynamicSpec = {
      ...swaggerSpec,
      servers: [
        {
          url: `${protocol}://${requestHost}/api`,
          description: 'Dynamic Server',
        },
      ],
    };
    res.json(dynamicSpec);
  });

  // Основний роут документації
  swaggerRouter.use('/api-docs', swaggerUi.serve);

  // Додаємо тип NextFunction для виправлення помилки TS2554
  swaggerRouter.get(
    '/api-docs',
    (req: Request, res: Response, next: NextFunction) => {
      const requestHost = req.get('host');
      const protocol = requestHost?.includes('ngrok-free.dev')
        ? 'https'
        : 'http';

      // Викликаємо setup з трьома аргументами (req, res, next)
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: `${protocol}://${requestHost}/api-docs/swagger.json`,
        },
      })(req, res, next); // Передаємо next сюди
    },
  );
} catch (error) {
  console.error('Failed to load Swagger spec:', error);
  swaggerRouter.use('/api-docs', (req: Request, res: Response) => {
    res.status(500).send('Swagger documentation is unavailable');
  });
}

export default swaggerRouter;
