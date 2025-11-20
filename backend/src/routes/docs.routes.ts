import { Router } from 'express';
import { swaggerDefinition } from '../docs/swagger';

const router = Router();

/**
 * GET /docs/swagger.json
 * Returns the OpenAPI/Swagger specification in JSON format
 */
router.get('/swagger.json', (req, res) => {
  res.json(swaggerDefinition);
});

/**
 * GET /docs/api
 * Serves a simple HTML page with Swagger UI
 * Users can visit /api/docs/api to view the documentation
 */
router.get('/api', (req, res) => {
  const swaggerUiHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anclora Impulso API - Swagger Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        padding: 0;
        background: #f5f5f5;
      }
      .topbar {
        background-color: #EA580C;
        padding: 1rem;
      }
      .topbar h1 {
        margin: 0;
        color: white;
        font-size: 1.5rem;
      }
    </style>
  </head>
  <body>
    <div class="topbar">
      <h1>Anclora Impulso API Documentation</h1>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: "/api/docs/swagger.json",
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
          deepLinking: true
        })
        window.ui = ui
      }
    </script>
  </body>
</html>
  `;
  res.set('Content-Type', 'text/html');
  res.send(swaggerUiHtml);
});

export default router;
