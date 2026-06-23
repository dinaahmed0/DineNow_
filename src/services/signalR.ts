import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './api/client';
import { readStoredUser } from '../lib/auth-session';

let connection: signalR.HubConnection | null = null;

/**
 * Initialize SignalR connection to ReservationHub
 * @returns SignalR HubConnection instance
 */
export function initializeSignalRConnection(): signalR.HubConnection {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  const user = readStoredUser();
  const token = user?.token || user?.accessToken || '';

  if (!token) {
    console.warn('SignalR: No token found, connection may fail');
  }

  // Build URL with access_token in query string (as backend expects)
  const connectionUrl = `${API_BASE_URL}/ReservationHub?access_token=${encodeURIComponent(token)}`;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(connectionUrl, {
      skipNegotiation: false,
      withCredentials: true,
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        // Exponential backoff: 0s, 2s, 10s, 30s, then 60s
        if (retryContext.previousRetryCount === 0) return 0;
        if (retryContext.previousRetryCount === 1) return 2000;
        if (retryContext.previousRetryCount === 2) return 10000;
        if (retryContext.previousRetryCount === 3) return 30000;
        return 60000;
      },
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Handle connection lifecycle events
  connection.onreconnecting((error) => {
    console.log('SignalR: Reconnecting...', error);
  });

  connection.onreconnected((connectionId) => {
    console.log('SignalR: Reconnected with connectionId:', connectionId);
    // Re-subscribe to events after reconnection
    setupEventListeners();
  });

  connection.onclose((error) => {
    console.log('SignalR: Connection closed', error);
  });

  return connection;
}

type NotificationType = 'success' | 'error' | 'info' | 'warning';

function dispatchNotification(message: string, type: NotificationType = 'info'): void {
  window.dispatchEvent(
    new CustomEvent('app:signalr-notification', { detail: { message, type } })
  );
}

/**
 * Setup all event listeners (called on initial connection and reconnection)
 */
function setupEventListeners(): void {
  if (!connection) return;

  // Remove all existing listeners to avoid duplicates
  connection.off('ReceiveNotification');
  connection.off('ReservationCreated');
  connection.off('ReservationUpdated');
  connection.off('ReservationStatusChanged');
  connection.off('ReservationCancelled');
  connection.off('ReservationApproved');
  connection.off('ReservationRejected');
  connection.off('ReservationCompleted');

  connection.on('ReceiveNotification', (notification: { title?: string; message?: string }) => {
    const msg = notification?.message ?? notification?.title ?? 'New notification';
    dispatchNotification(msg, 'info');
  });

  connection.on('ReservationApproved', () => {
    dispatchNotification('Your reservation has been approved!', 'success');
  });

  connection.on('ReservationRejected', () => {
    dispatchNotification('Your reservation has been rejected.', 'error');
  });

  connection.on('ReservationCreated', () => {
    dispatchNotification('New reservation received.', 'info');
  });

  connection.on('ReservationCancelled', () => {
    dispatchNotification('A reservation has been cancelled.', 'warning');
  });

  connection.on('ReservationStatusChanged', (data: { reservationId?: number; status?: string }) => {
    dispatchNotification(`Reservation status updated: ${data?.status ?? 'changed'}`, 'info');
  });

  connection.on('ReservationCompleted', () => {
    dispatchNotification('Reservation completed!', 'success');
  });

  console.log('SignalR: Event listeners setup complete');
}

/**
 * Start the SignalR connection
 */
export async function startSignalRConnection(): Promise<void> {
  const conn = initializeSignalRConnection();

  try {
    if (conn.state === signalR.HubConnectionState.Disconnected) {
      await conn.start();
      console.log('SignalR: Connection started successfully');
      setupEventListeners();
    } else if (conn.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR: Already connected');
    }
  } catch (error) {
    console.error('SignalR: Error starting connection:', error);
    throw error;
  }
}

/**
 * Stop the SignalR connection
 */
export async function stopSignalRConnection(): Promise<void> {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR: Connection stopped');
      connection = null;
    } catch (error) {
      console.error('SignalR: Error stopping connection:', error);
    }
  }
}

/**
 * Reinitialize the SignalR connection with a new token
 * Useful after token refresh
 */
export async function reinitializeSignalRConnection(): Promise<void> {
  await stopSignalRConnection();
  connection = null;
  await startSignalRConnection();
}
