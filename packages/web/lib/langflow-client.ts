/**
 * Langflow API Client for TravelAgentic
 * Handles communication with Langflow workflows for AI-powered travel planning
 */

export interface LangflowRunRequest {
  input_value: string | object;
  tweaks?: Record<string, any>;
  stream?: boolean;
  input_type?: 'chat' | 'text' | 'json';
}

export interface LangflowMessage {
  text: string;
  type?: string;
  data?: any;
  timestamp?: string;
}

export interface LangflowOutput {
  outputs: Array<{
    results: {
      message: LangflowMessage;
    };
  }>;
}

export interface LangflowRunResponse {
  outputs: LangflowOutput[];
  session_id?: string;
  flow_id?: string;
}

export interface LangflowFlow {
  id: string;
  name: string;
  description?: string;
  data?: any;
  created_at?: string;
  updated_at?: string;
}

export class LangflowClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = process.env.LANGFLOW_URL || 'http://localhost:7860';
    this.apiKey = process.env.LANGFLOW_API_KEY || '';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Run a Langflow workflow by flow ID
   * @param flowId - The ID of the flow to run
   * @param request - The request payload
   * @returns Promise<LangflowRunResponse>
   */
  async runFlow(
    flowId: string,
    request: LangflowRunRequest
  ): Promise<LangflowRunResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/run/${flowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          'User-Agent': 'TravelAgentic/1.0',
        },
        body: JSON.stringify({
          ...request,
          input_type: request.input_type || 'text',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Langflow request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Langflow request timed out');
        }
        throw new Error(`Langflow error: ${error.message}`);
      }
      throw new Error('Unknown Langflow error');
    }
  }

  /**
   * Run a flow by name (searches for flow first)
   * @param flowName - The name of the flow to run
   * @param request - The request payload
   * @returns Promise<LangflowRunResponse>
   */
  async runFlowByName(
    flowName: string,
    request: LangflowRunRequest
  ): Promise<LangflowRunResponse> {
    const flows = await this.getFlows();
    const flow = flows.find((f) => f.name === flowName);

    if (!flow) {
      throw new Error(`Flow "${flowName}" not found`);
    }

    return this.runFlow(flow.id, request);
  }

  /**
   * Get all available flows
   * @returns Promise<LangflowFlow[]>
   */
  async getFlows(): Promise<LangflowFlow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/flows`, {
        headers: {
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          'User-Agent': 'TravelAgentic/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get flows: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      return Array.isArray(result) ? result : result.flows || [];
    } catch (error) {
      console.error('Failed to get Langflow flows:', error);
      return [];
    }
  }

  /**
   * Get a specific flow by ID
   * @param flowId - The flow ID
   * @returns Promise<LangflowFlow | null>
   */
  async getFlow(flowId: string): Promise<LangflowFlow | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/flows/${flowId}`, {
        headers: {
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          'User-Agent': 'TravelAgentic/1.0',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(
          `Failed to get flow: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error(`Failed to get flow ${flowId}:`, error);
      return null;
    }
  }

  /**
   * Check if Langflow service is available
   * @returns Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'TravelAgentic/1.0',
        },
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Langflow health check failed:', error);
      return false;
    }
  }

  /**
   * Get Langflow version and status
   * @returns Promise<any>
   */
  async getStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/version`, {
        headers: {
          'User-Agent': 'TravelAgentic/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get Langflow status:', error);
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse response text from Langflow output
   * @param response - The Langflow response
   * @returns string
   */
  parseResponseText(response: LangflowRunResponse): string {
    try {
      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        if (output.outputs && output.outputs.length > 0) {
          return output.outputs[0].results.message.text || '';
        }
      }
      return '';
    } catch (error) {
      console.error('Failed to parse Langflow response:', error);
      return '';
    }
  }

  /**
   * Parse JSON data from Langflow output
   * @param response - The Langflow response
   * @returns any
   */
  parseResponseData(response: LangflowRunResponse): any {
    try {
      const text = this.parseResponseText(response);
      if (!text) return null;

      // Try to parse as JSON first
      try {
        return JSON.parse(text);
      } catch {
        // If not JSON, return as text
        return { text };
      }
    } catch (error) {
      console.error('Failed to parse Langflow response data:', error);
      return null;
    }
  }
}

// Singleton instance
export const langflowClient = new LangflowClient();
