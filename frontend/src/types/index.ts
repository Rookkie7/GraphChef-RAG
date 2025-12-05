export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface KnowledgeBaseStatus {
  knowledge_base_loaded: boolean;
  system_ready: boolean;
  milvus_collection_exists: boolean;
  stats?: {
    total_recipes: number;
    total_ingredients: number;
    total_cooking_steps: number;
    total_documents: number;
    total_chunks: number;
    milvus_records: number;
    categories?: Record<string, number>;
  };
}

export interface SystemStatus {
  system_ready: boolean;
  knowledge_base_loaded: boolean;
  config: {
    llm_model: string;
    top_k: number;
  };
}

export interface HealthStatus {
  status: string;
  system_initialized: boolean;
  knowledge_base_ready: boolean;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AskRequest {
  question: string;
  stream: boolean;
  explain: boolean;
}

export interface AskResponse {
  success: boolean;
  data: {
    answer: string;
    processing_time: number;
    analysis?: {
      strategy: string;
      complexity: number;
      confidence: number;
    };
  };
}
