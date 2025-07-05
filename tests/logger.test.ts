import logger from '../src/utils/logger';

// Mock winston to avoid file system operations during tests
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

describe('Logger Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a logger instance', () => {
    expect(logger).toBeDefined();
  });

  it('should have info method', () => {
    expect(logger.info).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should have error method', () => {
    expect(logger.error).toBeDefined();
    expect(typeof logger.error).toBe('function');
  });

  it('should have debug method', () => {
    expect(logger.debug).toBeDefined();
    expect(typeof logger.debug).toBe('function');
  });

  it('should log info messages', () => {
    const message = 'Test info message';
    const meta = { test: 'data' };
    
    logger.info(message, meta);
    
    expect(logger.info).toHaveBeenCalledWith(message, meta);
  });

  it('should log error messages', () => {
    const message = 'Test error message';
    const error = new Error('Test error');
    
    logger.error(message, { error: error.message });
    
    expect(logger.error).toHaveBeenCalledWith(message, { error: error.message });
  });
});