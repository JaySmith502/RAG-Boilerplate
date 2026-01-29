/**
 * API types matching FastAPI backend Pydantic schemas.
 * Source: src/posts/schemas.py, src/sessions/schemas.py,
 *         src/distributed_task/schemas.py, src/evaluation/schemas.py
 */

// ============================================
// Chat & Sessions
// ============================================

export interface ChatRequest {
  message: string
  session_id?: string | null
  metadata?: Record<string, unknown>
}

export interface ChatResponse {
  message: string
  session_id: string
  sources: string[]
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
}

export interface Session {
  session_id: string
  messages: Message[]
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

export interface SessionsListResponse {
  sessions: Session[]
}

// ============================================
// Retrieval
// ============================================

export type PipelineType = 'recursive_overlap' | 'semantic'

export interface RetrievalRequest {
  query: string
  top_k?: number
  use_query_enhancer?: boolean
  use_reranking?: boolean
  pipeline_type?: PipelineType
}

export interface RetrievedDocument {
  text: string
  source: string
  score: number | null
  metadata: Record<string, unknown>
}

export interface RetrievalResponse {
  query: string
  documents: RetrievedDocument[]
  total_retrieved: number
}

// ============================================
// Ingestion
// ============================================

export type IngestionStatus =
  | 'pending'
  | 'processing'
  | 'chunking'
  | 'indexing'
  | 'completed'
  | 'failed'

export interface IngestionJobRequest {
  folder_path: string
  file_types?: string[]
  pipeline_type?: PipelineType
}

export interface IngestionJobResponse {
  job_id: string
  status: string
  message: string
}

export interface TaskProgress {
  job_id: string
  status: IngestionStatus
  total_documents?: number
  processed_documents?: number
  successful_documents?: number
  failed_documents?: number
  documents_left?: number
  current_file?: string
  estimated_time_remaining_seconds?: number
  progress_percentage?: number
  error_message?: string
  total_time_seconds?: number
}

export interface AssetFolder {
  name: string
  path: string
  file_count?: number
}

export interface AssetsListResponse {
  folders: AssetFolder[]
}

// ============================================
// Evaluation
// ============================================

export interface EvaluationRequest {
  folder_path: string
  top_k?: number
  use_query_enhancer?: boolean
  use_reranking?: boolean
  num_questions_per_doc?: number
  source_evaluation_id?: string | null
  question_group_id?: string | null
}

export interface EvaluationStartResponse {
  evaluation_id: string
  question_group_id: string
  status: string
  message: string
}

export interface EvaluationResultsSummary {
  hit_rate?: number
  mrr?: number
  avg_score?: number
  total_questions?: number
}

export interface EvaluationStatusResponse {
  evaluation_id: string
  question_group_id: string
  status: string
  folder_path: string
  retrieve_params: Record<string, unknown>
  num_documents_processed: number
  created_at: string
  completed_at?: string
  results_summary?: EvaluationResultsSummary
  error_message?: string
  related_evaluation_ids: string[]
}

export interface EvaluationsListResponse {
  evaluations: EvaluationStatusResponse[]
}

// ============================================
// Common
// ============================================

/**
 * Generic API error response from FastAPI
 */
export interface ApiErrorResponse {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>
}
