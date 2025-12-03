import axios from 'axios';
import type {
  KnowledgeBaseStatus,
  SystemStatus,
  HealthStatus,
  AskRequest,
  AskResponse,
  ApiResponse
} from '../types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  health: async (): Promise<HealthStatus> => {
    const { data } = await apiClient.get<HealthStatus>('/health');
    return data;
  },

  getKnowledgeBaseStatus: async (): Promise<KnowledgeBaseStatus> => {
    const { data } = await apiClient.get<ApiResponse<KnowledgeBaseStatus>>('/knowledge-base/status');
    return data.data!;
  },

  buildKnowledgeBase: async (forceRebuild: boolean = false): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>('/knowledge-base/build', {
      force_rebuild: forceRebuild,
    });
    return data;
  },

  unloadKnowledgeBase: async (): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>('/knowledge-base/unload');
    return data;
  },

  deleteKnowledgeBase: async (): Promise<ApiResponse> => {
    const { data } = await apiClient.delete<ApiResponse>('/knowledge-base');
    return data;
  },

  ask: async (request: AskRequest): Promise<AskResponse> => {
    const { data } = await apiClient.post<AskResponse>('/ask', request);
    return data;
  },

  askStream: async (
    request: Omit<AskRequest, 'stream'>,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              onChunk(data);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      onError(error as Error);
    }
  },

  getSystemStatus: async (): Promise<SystemStatus> => {
    const { data } = await apiClient.get<ApiResponse<SystemStatus>>('/system/status');
    return data.data!;
  },

  reloadSystem: async (): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>('/system/reload');
    return data;
  },
};

export default api;
