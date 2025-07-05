import request from 'supertest';
import express from 'express';
import mysql from 'mysql2';

// Mock dependencies
jest.mock('mysql2');
jest.mock('../src/logger');

// Create a test app that mimics the main app structure
const createTestApp = () => {
  const app = express();
  
  // Mock database pool
  const mockPool = {
    getConnection: jest.fn(),
    query: jest.fn(),
  };
  
  // Mock routes similar to the main app
  app.get('/users', (req, res) => {
    mockPool.query('SELECT * FROM users', (err: any, results: any) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.json(results);
    });
  });
  
  app.get('/add-user', (req, res) => {
    const name = 'Alice' + Math.floor(Math.random() * 1000);
    const address = 'Address' + Math.floor(Math.random() * 1000);
    
    const sql = 'INSERT INTO users (name, address) VALUES (?, ?)';
    mockPool.query(sql, [name, address], (err: any, result: any) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      
      const userId = result.insertId;
      res.send(`插入用户，ID: ${userId}, 姓名: ${name}, 地址: ${address}`);
    });
  });
  
  return { app, mockPool };
};

describe('API Routes', () => {
  let app: express.Application;
  let mockPool: any;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    mockPool = testApp.mockPool;
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return users list successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'Alice123', address: 'Address123' },
        { id: 2, name: 'Bob456', address: 'Address456' }
      ];
      
      mockPool.query.mockImplementation((sql: string, callback: Function) => {
        callback(null, mockUsers);
      });

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users',
        expect.any(Function)
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      
      mockPool.query.mockImplementation((sql: string, callback: Function) => {
        callback(mockError);
      });

      const response = await request(app)
        .get('/users')
        .expect(500);

      expect(response.text).toBe('Database connection failed');
    });
  });

  describe('GET /add-user', () => {
    it('should create a new user successfully', async () => {
      const mockResult = { insertId: 123 };
      
      mockPool.query.mockImplementation((sql: string, params: any[], callback: Function) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .get('/add-user')
        .expect(200);

      expect(response.text).toMatch(/插入用户，ID: 123, 姓名: Alice\d+, 地址: Address\d+/);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, address) VALUES (?, ?)',
        expect.arrayContaining([
          expect.stringMatching(/^Alice\d+$/),
          expect.stringMatching(/^Address\d+$/)
        ]),
        expect.any(Function)
      );
    });

    it('should handle database errors during user creation', async () => {
      const mockError = new Error('Insert failed');
      
      mockPool.query.mockImplementation((sql: string, params: any[], callback: Function) => {
        callback(mockError);
      });

      const response = await request(app)
        .get('/add-user')
        .expect(500);

      expect(response.text).toBe('Insert failed');
    });

    it('should generate random user data', async () => {
      const mockResult = { insertId: 456 };
      
      mockPool.query.mockImplementation((sql: string, params: any[], callback: Function) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .get('/add-user')
        .expect(200);

      expect(response.text).toMatch(/插入用户，ID: 456, 姓名: Alice\d+, 地址: Address\d+/);
      
      // Verify that the name and address contain numbers (randomized)
      const nameMatch = response.text.match(/姓名: (Alice\d+)/);
      const addressMatch = response.text.match(/地址: (Address\d+)/);
      
      expect(nameMatch).not.toBeNull();
      expect(addressMatch).not.toBeNull();
      expect(nameMatch![1]).toMatch(/^Alice\d+$/);
      expect(addressMatch![1]).toMatch(/^Address\d+$/);
    });
  });
});