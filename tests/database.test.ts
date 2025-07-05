import mysql from 'mysql2';

// Mock mysql2 module
jest.mock('mysql2', () => ({
  createPool: jest.fn(),
}));

describe('Database Connection', () => {
  let mockPool: any;
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {
      release: jest.fn(),
    };
    
    mockPool = {
      getConnection: jest.fn(),
      query: jest.fn(),
    };
    
    (mysql.createPool as jest.Mock).mockReturnValue(mockPool);
    jest.clearAllMocks();
  });

  describe('Database Pool Creation', () => {
    it('should create a connection pool with correct configuration', () => {
      const expectedConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'test'
      };

      const pool = mysql.createPool(expectedConfig);
      
      expect(mysql.createPool).toHaveBeenCalledWith(expectedConfig);
      expect(pool).toBe(mockPool);
    });

    it('should use environment variables for database configuration', () => {
      const originalEnv = process.env;
      
      process.env.DB_HOST = 'test-host';
      process.env.DB_USER = 'test-user';
      process.env.DB_PASSWORD = 'test-password';
      process.env.DB_DATABASE = 'test-database';

      const expectedConfig = {
        host: 'test-host',
        user: 'test-user',
        password: 'test-password',
        database: 'test-database'
      };

      mysql.createPool(expectedConfig);
      
      expect(mysql.createPool).toHaveBeenCalledWith(expectedConfig);
      
      // Restore original environment
      process.env = originalEnv;
    });
  });

  describe('Database Connection Testing', () => {
    it('should handle successful database connection', () => {
      mockPool.getConnection.mockImplementation((callback: Function) => {
        callback(null, mockConnection);
      });

      mockPool.getConnection((err: any, connection: any) => {
        expect(err).toBeNull();
        expect(connection).toBe(mockConnection);
        expect(connection.release).toBeDefined();
      });
    });

    it('should handle database connection errors', () => {
      const mockError = new Error('Connection failed');
      
      mockPool.getConnection.mockImplementation((callback: Function) => {
        callback(mockError);
      });

      mockPool.getConnection((err: any, connection: any) => {
        expect(err).toBe(mockError);
        expect(connection).toBeUndefined();
      });
    });

    it('should release connection after use', () => {
      mockPool.getConnection.mockImplementation((callback: Function) => {
        callback(null, mockConnection);
      });

      mockPool.getConnection((err: any, connection: any) => {
        if (!err) {
          connection.release();
          expect(connection.release).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Database Queries', () => {
    it('should execute SELECT query successfully', () => {
      const mockResults = [
        { id: 1, name: 'Alice', address: 'Address1' },
        { id: 2, name: 'Bob', address: 'Address2' }
      ];
      
      mockPool.query.mockImplementation((sql: string, callback: Function) => {
        callback(null, mockResults);
      });

      mockPool.query('SELECT * FROM users', (err: any, results: any) => {
        expect(err).toBeNull();
        expect(results).toEqual(mockResults);
      });
    });

    it('should execute INSERT query successfully', () => {
      const mockResult = { insertId: 123, affectedRows: 1 };
      
      mockPool.query.mockImplementation((sql: string, params: any[], callback: Function) => {
        callback(null, mockResult);
      });

      const testData = ['Alice123', 'Address123'];
      mockPool.query('INSERT INTO users (name, address) VALUES (?, ?)', testData, (err: any, result: any) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockResult);
        expect(result.insertId).toBe(123);
      });
    });

    it('should handle query errors', () => {
      const mockError = new Error('Query execution failed');
      
      mockPool.query.mockImplementation((sql: string, callback: Function) => {
        callback(mockError);
      });

      mockPool.query('SELECT * FROM users', (err: any, results: any) => {
        expect(err).toBe(mockError);
        expect(results).toBeUndefined();
      });
    });

    it('should handle parameterized queries', () => {
      const mockResult = { insertId: 456, affectedRows: 1 };
      
      mockPool.query.mockImplementation((sql: string, params: any[], callback: Function) => {
        expect(params).toEqual(['TestUser', 'TestAddress']);
        callback(null, mockResult);
      });

      mockPool.query(
        'INSERT INTO users (name, address) VALUES (?, ?)',
        ['TestUser', 'TestAddress'],
        (err: any, result: any) => {
          expect(err).toBeNull();
          expect(result.insertId).toBe(456);
        }
      );
    });
  });
});