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
        },
        '/auth/register': {
            post: {
                summary: 'Register a user account',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'nickname', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'runner@example.com' },
                                    nickname: { type: 'string', example: 'Runner' },
                                    password: { type: 'string', format: 'password', example: 'password123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                message: { type: 'string', example: 'User registered successfully' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Missing required fields or email already exists',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        message: { type: 'string', example: 'Email already exists' }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Internal server error'
                    }
                }
            }
        },
        '/auth/login': {
            post: {
                summary: 'Log in with email and password',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'runner@example.com' },
                                    password: { type: 'string', format: 'password', example: 'password123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                message: { type: 'string', example: 'Login successful' },
                                                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                                user: {
                                                    type: 'object',
                                                    required: ['nickname', 'email', 'role', 'has_oauth', 'must_change_password', 'created_at'],
                                                    properties: {
                                                        nickname: { type: 'string', example: 'Runner' },
                                                        email: { type: 'string', format: 'email', example: 'runner@example.com' },
                                                        role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
                                                        has_oauth: { type: 'boolean', example: false },
                                                        must_change_password: { type: 'boolean', example: false },
                                                        created_at: { type: 'string', format: 'date-time', example: '2026-11-26T08:00:00.000Z' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Email or password is missing'
                    },
                    401: {
                        description: 'Invalid credentials or Google OAuth account',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        message: { type: 'string', example: '此帳號使用 Google 登入，請使用 Google 登入' },
                                        code: { type: 'string', example: 'GOOGLE_OAUTH_REQUIRED' }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Internal server error'
                    }
                }
            }
        }
    }
}
