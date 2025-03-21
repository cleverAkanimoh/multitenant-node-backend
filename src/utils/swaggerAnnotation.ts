/**
 * Generates a Swagger annotation for an API endpoint.
 * @param {string} method - HTTP method (get, post, put, delete, etc.).
 * @param {string} path - API endpoint path.
 * @param {string} summary - Short description of the endpoint.
 * @param {string[]} tags - Tags for grouping endpoints in Swagger UI.
 * @param {object} [requestBody] - Optional request body schema.
 * @param {object} responses - Response schema.
 * @returns {string} - JSDoc string for Swagger annotation.
 */

type TSwaggerAnnotation = {
  method: string;
  path: string;
  summary: string;
  tags: string[];
  requestBody: object | null;
  responses: object;
};
export const swaggerAnnotation = ({
  method,
  path,
  summary,
  tags,
  requestBody,
  responses,
}: TSwaggerAnnotation): string => {
  let swagger = `
/**
 * @swagger
 * ${path}:
 *   ${method}:
 *     summary: ${summary}
 *     tags: [${tags.join(", ")}]
`;
  if (requestBody) {
    swagger += ` *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
`;
    for (const [key, value] of Object.entries(requestBody)) {
      swagger += ` *               ${key}:
 *                 type: ${value}
`;
    }
  }

  swagger += ` *     responses:
`;
  for (const [statusCode, description] of Object.entries(responses)) {
    swagger += ` *       ${statusCode}:
 *         description: ${description}
`;
  }

  swagger += ` */
`;
  return swagger;
};
