export type ResourceStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ResourceState<T>{
  data: T;
  status: ResourceStatus;
  error: string | null;
}
