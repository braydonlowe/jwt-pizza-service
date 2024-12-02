const { DB } = require('./database');
const { Role } = require('./database');

const config = {
    db: {
      connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'mysql',
        database: 'pizza',
        connectTimeout: 60000,  
      },
    },
  };

describe('getFranchises', () => {
  test('should call getFranchise for each franchise when user is an admin', async () => {
    const authUser = { 
      isRole: jest.fn(role => role === Role.Admin),
    };
    const mockFranchises = [
      { id: 1, name: 'Franchise 1' },
      { id: 2, name: 'Franchise 2' },
    ];
    DB.query = jest.fn()
      .mockResolvedValueOnce(mockFranchises) 
      .mockResolvedValueOnce([]); 
    DB.getFranchise = jest.fn();

    const result = await DB.getFranchises(authUser);

    expect(DB.getFranchise).toHaveBeenCalledTimes(mockFranchises.length);
    expect(DB.getFranchise).toHaveBeenCalledWith(mockFranchises[0]);
    expect(DB.getFranchise).toHaveBeenCalledWith(mockFranchises[1]);

    expect(result).toEqual(mockFranchises);
  });

  describe('initializeDatabase', () => {
      test('should add default admin when database does not exist', async () => {
      const mockAddUser = jest.spyOn(DB, 'addUser').mockResolvedValueOnce({}); 
  
      const mockCheckDatabaseExists = jest.spyOn(DB, 'checkDatabaseExists').mockResolvedValueOnce(false); 
      const mockConnection = {
        query: jest.fn().mockResolvedValueOnce(null), 
        end: jest.fn(), 
      };
      
      jest.spyOn(DB, '_getConnection').mockResolvedValueOnce(mockConnection);
  
      await DB.initializeDatabase(); 
  
    
      expect(mockCheckDatabaseExists).toHaveBeenCalledTimes(1);
      expect(mockAddUser).toHaveBeenCalledTimes(1);
      expect(mockAddUser).toHaveBeenCalledWith({
        name: '常用名字',
        email: 'a@jwt.com',
        password: 'admin',
        roles: [{ role: Role.Admin }],
      });
  
    
      mockAddUser.mockRestore();
    });
  

    test('should log an error if database initialization fails', async () => {
      const mockError = new Error('Database error');
      
      
      jest.spyOn(DB, '_getConnection').mockRejectedValueOnce(mockError); 
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); 
  
      await DB.initializeDatabase(); 
  
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Error initializing database',
          exception: mockError.message,
          connection: config.db.connection,
        })
      );
  
      
      consoleErrorSpy.mockRestore();
    });
  
  });
});
