/**
 * Streaming API hook for managing Server-Sent Events and streaming connections
 * Provides robust streaming capabilities with automatic reconnection and error handling
 */

import { useCallback, useRef, useState, useEffect } from 'react';

export interface StreamingOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface StreamingState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastMessage: any;
  connectionId: string | null;
}

export function useStreamingAPI() {
  const [state, setState] = useState<StreamingState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastMessage: null,
    connectionId: null,
  });

  const abortController = useRef<AbortController | null>(null);
  const eventSource = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  // Clean up function
  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    
    if (eventSource.current) {
      eventSource.current.close();
      eventSource.current = null;
    }
    
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  // Connect to streaming endpoint using fetch
  const connectWithFetch = useCallback(async (
    url: string,
    data: any,
    options: StreamingOptions = {},
    onMessage: (data: any) => void
  ) => {
    const {
      autoReconnect = true,
      maxReconnectAttempts = 3,
      reconnectDelay = 1000,
      timeout = 30000,
      headers = {}
    } = options;

    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null,
      connectionId: `conn_${Date.now()}`
    }));

    try {
      // Create new abort controller
      abortController.current = new AbortController();
      
      // Add timeout
      const timeoutId = setTimeout(() => {
        if (abortController.current) {
          abortController.current.abort();
        }
      }, timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/stream',
          ...headers,
        },
        body: JSON.stringify(data),
        signal: abortController.current.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body available');
      }

      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false,
        reconnectAttempts: 0
      }));

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (abortController.current?.signal.aborted) {
          break;
        }

        const { value, done } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last line in buffer if it's incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  setState(prev => ({ 
                    ...prev, 
                    isConnected: false,
                    isConnecting: false
                  }));
                  return;
                }
                
                const parsedData = JSON.parse(dataStr);
                setState(prev => ({ ...prev, lastMessage: parsedData }));
                onMessage(parsedData);
              }
            } catch (error) {
              console.error('Error parsing streaming data:', error);
            }
          }
        }
      }

      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isConnecting: false
      }));

    } catch (error) {
      console.error('Streaming connection error:', error);
      
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));

      // Auto-reconnect logic
      if (autoReconnect && state.reconnectAttempts < maxReconnectAttempts) {
        setState(prev => ({ 
          ...prev, 
          reconnectAttempts: prev.reconnectAttempts + 1
        }));
        
        reconnectTimer.current = setTimeout(() => {
          connectWithFetch(url, data, options, onMessage);
        }, reconnectDelay * Math.pow(2, state.reconnectAttempts)); // Exponential backoff
      }
    }
  }, [state.reconnectAttempts]);

  // Connect using EventSource (for GET requests)
  const connectWithEventSource = useCallback((
    url: string,
    options: StreamingOptions = {},
    onMessage: (data: any) => void
  ) => {
    const {
      autoReconnect = true,
      maxReconnectAttempts = 3,
      reconnectDelay = 1000
    } = options;

    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null,
      connectionId: `sse_${Date.now()}`
    }));

    try {
      eventSource.current = new EventSource(url);

      eventSource.current.onopen = () => {
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isConnecting: false,
          reconnectAttempts: 0
        }));
      };

      eventSource.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: data }));
          onMessage(data);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.current.onerror = (error) => {
        console.error('EventSource error:', error);
        
        setState(prev => ({ 
          ...prev, 
          isConnected: false,
          isConnecting: false,
          error: 'EventSource connection failed'
        }));

        // Auto-reconnect logic
        if (autoReconnect && state.reconnectAttempts < maxReconnectAttempts) {
          setState(prev => ({ 
            ...prev, 
            reconnectAttempts: prev.reconnectAttempts + 1
          }));
          
          reconnectTimer.current = setTimeout(() => {
            connectWithEventSource(url, options, onMessage);
          }, reconnectDelay * Math.pow(2, state.reconnectAttempts));
        }
      };

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to create EventSource'
      }));
    }
  }, [state.reconnectAttempts]);

  // Disconnect from streaming endpoint
  const disconnect = useCallback(() => {
    cleanup();
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      isConnecting: false,
      error: null,
      connectionId: null
    }));
  }, [cleanup]);

  // Register message handler for specific event types
  const onMessage = useCallback((eventType: string, handler: (data: any) => void) => {
    messageHandlers.current.set(eventType, handler);
    
    // Return unregister function
    return () => {
      messageHandlers.current.delete(eventType);
    };
  }, []);

  // Send message through existing connection (WebSocket style)
  const sendMessage = useCallback(async (message: any) => {
    // This would be implemented if we add WebSocket support
    console.warn('sendMessage not implemented for current connection type');
  }, []);

  // Reconnect manually
  const reconnect = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      reconnectAttempts: 0,
      error: null
    }));
    // Would need to store connection parameters to reconnect
  }, []);

  // Check connection health
  const ping = useCallback(async (): Promise<boolean> => {
    if (!state.isConnected) return false;
    
    try {
      // Could implement a ping/pong mechanism
      return true;
    } catch {
      return false;
    }
  }, [state.isConnected]);

  // Get connection statistics
  const getConnectionStats = useCallback(() => {
    return {
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      hasError: Boolean(state.error),
      reconnectAttempts: state.reconnectAttempts,
      connectionId: state.connectionId,
      lastMessageTime: state.lastMessage ? new Date() : null,
    };
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Connection state
    ...state,
    
    // Connection methods
    connectWithFetch,
    connectWithEventSource,
    disconnect,
    reconnect,
    
    // Message handling
    onMessage,
    sendMessage,
    
    // Utilities
    ping,
    getConnectionStats,
    
    // Computed state
    canReconnect: !state.isConnected && !state.isConnecting,
    hasReachedMaxAttempts: state.reconnectAttempts >= 3,
  };
} 