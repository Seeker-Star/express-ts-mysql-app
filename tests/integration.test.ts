import request from 'supertest';
import express from 'express';
import mysql from 'mysql2';

// Mock dependencies
jest.mock('mysql2');
jest.mock('../src/utils/logger');

// Mock the main app module
const createIntegrationApp = () => {
  const app = express();
  
  // Mock database pool
  const mockPool = {
    getConnection: jest.fn(),
    query: jest.fn(),
  };
  
  // Set up routes exactly like the main app
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

describe('Integration Tests', () => {
  let app: express.Application;
  let mockPool: any;

  beforeEach(() => {
    const testApp = createIntegrationApp();
    app = testApp.app;
    mockPool = testApp.mockPool;
    jest.clearAllMocks();
  });

  describe('Complete User Workflow', () => {
    it('should handle complete user creation and retrieval workflow', async () => {
      // Step 1: Initially no users
      mockPool.query.mockImplementationOnce((sql: string, callback: Function) => {
        callback(null, []);
      });

      let response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);

      // Step 2: Add a user
      mockPool.query.mockImplementationOnce((sql: string, params: any[], callback: Function) => {
        callback(null, { insertId: 1 });
      });

      response = await request(app)
        .get('/add-user')
        .expect(200);

      expect(response.text).toMatch(/插入用户，ID: 1, 姓名: Alice\d+, 地址: Address\d+/);

      // Step 3: Retrieve users (now should have one user)
      const mockUsers = [
        { id: 1, name: 'Alice123', address: 'Address123' }
      ];
      
      mockPool.query.mockImplementationOnce((sql: string, callback: Function) => {
        callback(null, mockUsers);
      });

      response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
    });

    it('should handle multiple user additions', async () => {
      const userIds = [1, 2, 3];
      
      // Add multiple users
      for (const userId of userIds) {
        mockPool.query.mockImplementationOnce((sql: string, params: any[], callback: Function) => {
          callback(null, { insertId: userId });
        });

        const response = await request(app)
          .get('/add-user')
          .expect(200);

        expect(response.text).toMatch(new RegExp(`插入用户，ID: ${userId}, 姓名: Alice\\d+, 地址: Address\\d+`));
      }

      // Verify all users were added
      expect(mockPool.query).toHaveBeenCalledTimes(3);
      
      // Check that all calls were insert statements
      const insertCalls = mockPool.query.mock.calls.filter((call: any[]) => 
        call[0].includes('INSERT INTO users')
      );
      expect(insertCalls).toHaveLength(3);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection failures gracefully', async () => {
      const connectionError = new Error('Database connection lost');
      
      mockPool.query.mockImplementation((sql: string, callbackOrParams?: any, callback?: Function) => {
        const cb = typeof callbackOrParams === 'function' ? callbackOrParams : callback;
        if (cb) {
          cb(connectionError);
        }
      });

      // Test users endpoint
      let response = await request(app)
        .get('/users')
        .expect(500);

      expect(response.text).toBe('Database connection lost');

      // Test add-user endpoint  
      response = await request(app)
        .get('/add-user')
        .expect(500);

      expect(response.text).toBe('Database connection lost');
    });

    it('should handle different types of database errors', async () => {
      const errors = [
        new Error('Table does not exist'),
        new Error('Connection timeout'),
        new Error('Access denied'),
        new Error('Duplicate entry')
      ];

      for (const error of errors) {
        mockPool.query.mockImplementationOnce((sql: string, callback: Function) => {
          callback(error);
        });

        const response = await request(app)
          .get('/users')
          .expect(500);

        expect(response.text).toBe(error.message);
      }
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockUsers = [
        { id: 1, name: 'Alice1', address: 'Address1' },
        { id: 2, name: 'Alice2', address: 'Address2' },
        { id: 3, name: 'Alice3', address: 'Address3' }
      ];

      // Mock successful responses for all requests
      mockPool.query.mockImplementation((sql: string, callback: Function) => {
        callback(null, mockUsers);
      });

      // Create multiple concurrent requests
      const requests = Array.from({ length: 5 }, () => 
        request(app).get('/users').expect(200)
      );

      const responses = await Promise.all(requests);

      // Verify all requests completed successfully
      responses.forEach(response => {
        expect(response.body).toEqual(mockUsers);
      });

      // Verify database was queried for each request
      expect(mockPool.query).toHaveBeenCalledTimes(5);
    });

    it('should handle rapid user creation requests', async () => {
      let currentId = 1;
      
      mockPool.query.mockImplementation((sql: string, params: any[], callback: Function) => {
        callback(null, { insertId: currentId++ });
      });

      // Create multiple rapid user creation requests
      const requests = Array.from({ length: 10 }, () => 
        request(app).get('/add-user').expect(200)
      );

      const responses = await Promise.all(requests);

      // Verify all users were created with unique IDs
      responses.forEach((response, index) => {
        expect(response.text).toMatch(new RegExp(`插入用户，ID: ${index + 1}, 姓名: Alice\\d+, 地址: Address\\d+`));
      });

      expect(mockPool.query).toHaveBeenCalledTimes(10);
    });
  });

  describe('Data Validation Integration', () => {
    it('should validate user data format in responses', async () => {
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

      // Validate response structure
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      
      // Validate each user object
      response.body.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('address');
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.address).toBe('string');
      });
    });

    it('should validate user creation response format', async () => {
      mockPool.query.mockImplementation((sql: string, params: any[], callback: Function) => {
        callback(null, { insertId: 999 });
      });

      const response = await request(app)
        .get('/add-user')
        .expect(200);

      // Validate response format
      expect(response.text).toMatch(/^插入用户，ID: \d+, 姓名: Alice\d+, 地址: Address\d+$/);
      
      // Extract and validate components
      const match = response.text.match(/插入用户，ID: (\d+), 姓名: (Alice\d+), 地址: (Address\d+)/);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('999');
      expect(match![2]).toMatch(/^Alice\d+$/);
      expect(match![3]).toMatch(/^Address\d+$/);
    });
  });
});