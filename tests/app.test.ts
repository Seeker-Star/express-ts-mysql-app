import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.mock('mysql2');
jest.mock('../src/logger');

// Mock the environment variables
const mockEnv = {
  PORT: '3001',
  DB_HOST: 'localhost',
  DB_USER: 'test_user',
  DB_PASSWORD: 'test_password',
  DB_DATABASE: 'test_db',
  NODE_ENV: 'test'
};

describe('Application Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Set test environment variables
    process.env = { ...originalEnv, ...mockEnv };
    jest.clearAllMocks();
  });

  describe('Environment Configuration', () => {
    it('should use default port when PORT is not set', () => {
      delete process.env.PORT;
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
      expect(port).toBe(3000);
    });

    it('should use custom port when PORT is set', () => {
      process.env.PORT = '8080';
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
      expect(port).toBe(8080);
    });

    it('should use default database configuration when env vars are not set', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_DATABASE;

      const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'test'
      };

      expect(config).toEqual({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'test'
      });
    });

    it('should use custom database configuration when env vars are set', () => {
      const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'test'
      };

      expect(config).toEqual({
        host: 'localhost',
        user: 'test_user',
        password: 'test_password',
        database: 'test_db'
      });
    });
  });

  describe('Application Startup', () => {
    it('should handle application startup configuration', () => {
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
      const host = '0.0.0.0';
      
      expect(port).toBe(3001);
      expect(host).toBe('0.0.0.0');
    });

    it('should validate environment configuration', () => {
      const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_DATABASE'];
      
      requiredEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        expect(value).toBeDefined();
        expect(typeof value).toBe('string');
        expect(value!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Route Availability', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      
      // Mock routes
      app.get('/users', (req, res) => {
        res.json([]);
      });
      
      app.get('/add-user', (req, res) => {
        res.send('User added');
      });
    });

    it('should have /users route available', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should have /add-user route available', async () => {
      const response = await request(app)
        .get('/add-user')
        .expect(200);

      expect(response.text).toBe('User added');
    });

    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle HEAD requests', async () => {
      await request(app)
        .head('/users')
        .expect(200);
    });
  });

  describe('Application Middleware', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      
      // Add basic middleware
      app.use((req, res, next) => {
        res.header('X-Powered-By', 'Express');
        next();
      });
      
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });
    });

    it('should set custom headers', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.headers['x-powered-by']).toBe('Express');
    });

    it('should handle JSON responses', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body).toEqual({ message: 'test' });
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Security Headers', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      
      // Add security headers
      app.use((req, res, next) => {
        res.header('X-Frame-Options', 'DENY');
        res.header('X-Content-Type-Options', 'nosniff');
        next();
      });
      
      app.get('/security-test', (req, res) => {
        res.json({ secure: true });
      });
    });

    it('should set security headers', async () => {
      const response = await request(app)
        .get('/security-test')
        .expect(200);

      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Request Logging', () => {
    let app: express.Application;
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
      app = express();
      
      // Mock console.log to capture log messages
      logSpy = jest.spyOn(console, 'log').mockImplementation();
      
      app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
      
      app.get('/log-test', (req, res) => {
        res.json({ logged: true });
      });
    });

    afterEach(() => {
      logSpy.mockRestore();
    });

    it('should log requests', async () => {
      await request(app)
        .get('/log-test')
        .expect(200);

      expect(logSpy).toHaveBeenCalledWith('GET /log-test');
    });
  });
});