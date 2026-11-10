/**
 * OpenAPI 3.0 規格定義，提供 Swagger UI（/api-docs）與 /api-docs.json 使用。
 * 新增 API 路由時，請同步在 paths 中補上對應說明。
 */
module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'Runner Project API',
        version: '1.0.0'
    },
    paths: {
        // GET /：API 存活檢查
        '/': {
            get: {
                summary: 'Check that the API is responding',
                responses: {
                    200: {
                        description: 'API is responding',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        statusCode: { type: 'integer', example: 200 },
                                        message: { type: 'string', example: 'ok' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        // GET /health：服務與資料庫健康檢查
        '/health': {
            get: {
                summary: 'Check the health of the service',
                responses: {
                    200: {
                        description: 'Service is healthy',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        statusCode: { type: 'integer', example: 200 },
                                        message: { type: 'string', example: 'success get health' },
                                        data: { type: 'object', example: {} }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
