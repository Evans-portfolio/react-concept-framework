/**
 * HTTP Client unit tests
 */

import { HttpClient, http } from '../../src/http/client.js';
import { jest } from '@jest/globals';

// Mock global fetch
global.fetch = jest.fn();

describe('HttpClient', () => {
  let client;

  beforeEach(() => {
    client = new HttpClient();
    fetch.mockClear();
  });

  describe('GET requests', () => {
    test('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      });

      const result = await client.get('/api/users/1');

      expect(fetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockData);
    });

    test('should handle GET request errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(client.get('/api/users/999')).rejects.toThrow('Not Found');
    });
  });

  describe('POST requests', () => {
    test('should make successful POST request', async () => {
      const postData = { username: 'test', password: 'pass' };
      const mockResponse = { token: 'abc123' };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      });

      const result = await client.post('/api/login', postData);

      expect(fetch).toHaveBeenCalledWith('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      expect(result).toEqual(mockResponse);
    });

    test('should handle POST validation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(
        client.post('/api/users', { name: '' })
      ).rejects.toThrow('Bad Request');
    });
  });

  describe('PUT requests', () => {
    test('should make successful PUT request', async () => {
      const updateData = { name: 'Updated Name' };
      const mockResponse = { id: 1, ...updateData };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      });

      const result = await client.put('/api/users/1', updateData);

      expect(fetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    test('should make successful DELETE request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      });

      const result = await client.delete('/api/users/1');

      expect(fetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual({ success: true });
    });

    test('should handle DELETE errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(client.delete('/api/users/999')).rejects.toThrow();
    });
  });

  describe('Error handling', () => {
    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/api/data')).rejects.toThrow('Network error');
    });

    test('should handle 500 errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(client.get('/api/data')).rejects.toThrow('Internal Server Error');
    });

    test('should include status code in error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      try {
        await client.get('/api/protected');
      } catch (error) {
        expect(error.status).toBe(403);
        expect(error.message).toBe('Forbidden');
      }
    });
  });

  describe('Content-Type handling', () => {
    test('should handle JSON response', async () => {
      const mockData = { data: 'json' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      });

      const result = await client.get('/api/json');
      expect(result).toEqual(mockData);
    });

    test('should handle text response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Plain text response'
      });

      const result = await client.get('/api/text');
      expect(result).toBe('Plain text response');
    });
  });

  describe('Base URL', () => {
    test('should use base URL', async () => {
      const clientWithBase = new HttpClient('https://api.example.com');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({})
      });

      await clientWithBase.get('/users');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object)
      );
    });
  });
});

describe('Global http instance', () => {
  test('should have global http client', () => {
    expect(http).toBeDefined();
    expect(http.get).toBeDefined();
    expect(http.post).toBeDefined();
    expect(http.put).toBeDefined();
    expect(http.delete).toBeDefined();
  });
});
