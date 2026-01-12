import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const createOrdersWsClient = (onMessage) => {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    client.subscribe('/topic/orders', (message) => {
      try {
        const payload = JSON.parse(message.body);
        onMessage?.(payload);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error('Broker error', frame.headers['message'], frame.body);
  };

  return client;
};
