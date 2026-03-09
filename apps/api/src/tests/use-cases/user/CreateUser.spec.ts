import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUser';
import { UserRepository } from '../../../application/ports/user/UserRepository';
import { User, CreateUserData } from '../../../domain/entities/user/User';
import { UserAlreadyExistsError } from '../../../domain/errors/DomainError';

// Mock repository
const mockUserRepository: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  list: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userData: CreateUserData;

  beforeEach(() => {
    useCase = new CreateUserUseCase(mockUserRepository);
    userData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    // Arrange
    const expectedUser: User = {
      id: 1,
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(expectedUser);

    // Act
    const result = await useCase.execute(userData);

    // Assert
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    expect(result).toEqual(expectedUser);
  });

  it('should throw UserAlreadyExistsError when email is already taken', async () => {
    // Arrange
    const existingUser: User = {
      id: 1,
      name: 'Existing User',
      email: userData.email,
      createdAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    // Act & Assert
    await expect(useCase.execute(userData)).rejects.toThrow(UserAlreadyExistsError);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

    // Act & Assert
    await expect(useCase.execute(userData)).rejects.toThrow('Database error');
  });
});