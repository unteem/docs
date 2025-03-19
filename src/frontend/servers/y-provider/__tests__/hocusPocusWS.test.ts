import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import WebSocket from 'ws';

const port = 5559;
const portWS = 6666;
const origin = 'http://localhost:3000';

jest.mock('../src/env', () => {
  return {
    PORT: port,
    COLLABORATION_SERVER_ORIGIN: origin,
    COLLABORATION_SERVER_SECRET: 'test-secret-api-key',
    COLLABORATION_BACKEND_BASE_URL: 'http://app-dev:8000',
  };
});

console.error = jest.fn();

jest.mock('@/servers/hocusPocusServer', () => ({
  ...jest.requireActual('@/servers/hocusPocusServer'),
  fetchDocument: jest.fn(),
}));

import { fetchDocument, hocusPocusServer } from '@/servers/hocusPocusServer';

import { promiseDone } from '../src/helpers';
import { initServer } from '../src/servers/appServer';

const { server } = initServer();

describe('Server Tests', () => {
  beforeAll(async () => {
    await hocusPocusServer.configure({ port: portWS }).listen();
    jest.resetAllMocks();
  });

  afterAll(() => {
    server.close();
    void hocusPocusServer.destroy();
  });


  test('WebSocket connection with bad origin should be closed', () => {
    const { promise, done } = promiseDone();

    const ws = new WebSocket(
      `ws://localhost:${port}/collaboration/ws/?room=test-room`,
      {
        headers: {
          Origin: 'http://bad-origin.com',
        },
      },
    );

    ws.onclose = () => {
      expect(ws.readyState).toBe(ws.CLOSED);
      done();
    };

    return promise;
  });

  test('WebSocket connection without cookies header should be closed', () => {
    const { promise, done } = promiseDone();

    const ws = new WebSocket(
      `ws://localhost:${port}/collaboration/ws/?room=test-room`,
      {
        headers: {
          Origin: origin,
        },
      },
    );

    ws.onclose = () => {
      expect(ws.readyState).toBe(ws.CLOSED);
      done();
    };

    return promise;
  });

  test('WebSocket connection not allowed if room not matching provider name', () => {
    const { promise, done } = promiseDone();

    const wsHocus = new HocuspocusProviderWebsocket({
      url: `ws://localhost:${portWS}/?room=my-test`,
      WebSocketPolyfill: WebSocket,
      maxAttempts: 1,
      quiet: true,
    });

    const provider = new HocuspocusProvider({
      websocketProvider: wsHocus,
      name: 'hocuspocus-test',
      broadcast: false,
      quiet: true,
      preserveConnection: false,
      onClose: (data) => {
        wsHocus.stopConnectionAttempt();
        expect(data.event.reason).toBe('Forbidden');
        wsHocus.webSocket?.close();
        wsHocus.disconnect();
        provider.destroy();
        wsHocus.destroy();
        done();
      },
    });

    return promise;
  });

  test('WebSocket connection fails if user can not access document', () => {
    const { promise, done } = promiseDone();

    (fetchDocument as jest.Mock).mockRejectedValue('');

    const wsHocus = new HocuspocusProviderWebsocket({
      url: `ws://localhost:${portWS}/?room=my-test`,
      WebSocketPolyfill: WebSocket,
      maxAttempts: 1,
      quiet: true,
    });

    const provider = new HocuspocusProvider({
      websocketProvider: wsHocus,
      name: 'my-test',
      broadcast: false,
      quiet: true,
      preserveConnection: false,
      onClose: (data) => {
        wsHocus.stopConnectionAttempt();
        expect(data.event.reason).toBe('Forbidden');
        expect(fetchDocument).toHaveBeenCalledTimes(1);
        wsHocus.webSocket?.close();
        wsHocus.disconnect();
        provider.destroy();
        wsHocus.destroy();
        done();
      },
    });

    return promise;
  });
});