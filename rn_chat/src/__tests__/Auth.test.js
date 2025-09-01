import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthScreen from '../screens/AuthScreen';
import { AuthProvider } from '../contexts/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const renderWithProviders = (component) => {
  return render(
    <NavigationContainer>
      <AuthProvider>
        {component}
      </AuthProvider>
    </NavigationContainer>
  );
};

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Screen', () => {
    test('should render login form correctly', () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(<AuthScreen />);
      
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    test('should validate required fields', async () => {
      const { getByText } = renderWithProviders(<AuthScreen />);
      
      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    test('should validate email format', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(<AuthScreen />);
      
      const emailInput = getByPlaceholderText('Email');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(getByText('Invalid email format')).toBeTruthy();
      });
    });

    test('should handle successful login', async () => {
      const axios = require('axios');
      const mockResponse = {
        data: {
          success: true,
          token: 'mock-jwt-token',
          user: {
            _id: 'user-id',
            email: 'test@example.com',
            fullName: 'Test User'
          }
        }
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const { getByPlaceholderText, getByText } = renderWithProviders(<AuthScreen />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    test('should handle login error', async () => {
      const axios = require('axios');
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };

      axios.post.mockRejectedValueOnce(mockError);

      const { getByPlaceholderText, getByText } = renderWithProviders(<AuthScreen />);
      
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });
  });

  describe('Registration Screen', () => {
    test('should switch to registration form', () => {
      const { getByText } = renderWithProviders(<AuthScreen />);
      
      const switchButton = getByText("Don't have an account? Sign Up");
      fireEvent.press(switchButton);

      expect(getByPlaceholderText('First Name')).toBeTruthy();
      expect(getByPlaceholderText('Last Name')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
    });

    test('should validate registration form', async () => {
      const { getByText } = renderWithProviders(<AuthScreen />);
      
      // Switch to registration
      const switchButton = getByText("Don't have an account? Sign Up");
      fireEvent.press(switchButton);

      const signUpButton = getByText('Sign Up');
      fireEvent.press(signUpButton);

      await waitFor(() => {
        expect(getByText('First name is required')).toBeTruthy();
        expect(getByText('Last name is required')).toBeTruthy();
        expect(getByText('Email is required')).toBeTruthy();
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    test('should handle successful registration', async () => {
      const axios = require('axios');
      const mockResponse = {
        data: {
          success: true,
          message: 'Please check your email for activation',
          activationToken: 'mock-activation-token'
        }
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);
      
      // Switch to registration
      const switchButton = getByText("Don't have an account? Sign Up");
      fireEvent.press(switchButton);

      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signUpButton = getByText('Sign Up');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signUpButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      });
    });
  });

  describe('Password Reset', () => {
    test('should show forgot password form', () => {
      const { getByText } = renderWithProviders(<AuthScreen />);
      
      const forgotPasswordLink = getByText('Forgot Password?');
      fireEvent.press(forgotPasswordLink);

      expect(getByText('Reset Password')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
    });

    test('should handle password reset request', async () => {
      const axios = require('axios');
      const mockResponse = {
        data: {
          success: true,
          message: 'Password reset email sent'
        }
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const { getByText, getByPlaceholderText } = renderWithProviders(<AuthScreen />);
      
      const forgotPasswordLink = getByText('Forgot Password?');
      fireEvent.press(forgotPasswordLink);

      const emailInput = getByPlaceholderText('Email');
      const submitButton = getByText('Send Reset Email');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
          email: 'test@example.com'
        });
      });
    });
  });

  describe('Biometric Authentication', () => {
    test('should show biometric login option', () => {
      const { getByText } = renderWithProviders(<AuthScreen />);
      
      expect(getByText('Use Biometric')).toBeTruthy();
    });

    test('should handle biometric authentication', async () => {
      // Mock biometric authentication
      const mockBiometricAuth = jest.fn().mockResolvedValue(true);
      
      const { getByText } = renderWithProviders(<AuthScreen />);
      
      const biometricButton = getByText('Use Biometric');
      fireEvent.press(biometricButton);

      await waitFor(() => {
        expect(mockBiometricAuth).toHaveBeenCalled();
      });
    });
  });
});
