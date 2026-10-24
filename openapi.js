module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'Runner Project API',
        version: '1.0.0'
    },
    paths: {
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
