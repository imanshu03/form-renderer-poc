import { useEffect, useState, useRef, useCallback } from 'react';
import { RemoteOptionsConfig, StaticOption } from '../../types/schema';
import { resolvePlaceholdersDeep, extractPlaceholderPathsDeep } from '../../engine/placeholders';
import { deepGet } from '../../utils/deepGet';

interface UseRemoteOptionsParams {
  config: RemoteOptionsConfig;
  formValues: Record<string, any>;
  globals?: Record<string, any>;
  enabled?: boolean;
}

interface UseRemoteOptionsResult {
  options: StaticOption[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching and managing remote options for select fields
 */
export function useRemoteOptions({
  config,
  formValues,
  globals = {},
  enabled = true,
}: UseRemoteOptionsParams): UseRemoteOptionsResult {
  const [options, setOptions] = useState<StaticOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track previous dependency values to detect changes
  const prevDepsRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current dependency values
  const getDependencyValues = useCallback(() => {
    if (!config.dependencies) return '';
    
    const depValues: Record<string, any> = {};
    config.dependencies.forEach(dep => {
      depValues[dep] = formValues[dep];
    });
    
    return JSON.stringify(depValues);
  }, [config.dependencies, formValues]);

  // Fetch options from remote endpoint
  const fetchOptions = useCallback(async () => {
    if (!enabled) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the request by 300ms
    fetchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // Create new abort controller
        abortControllerRef.current = new AbortController();

        // Resolve placeholders in URL and other config
        const context = { values: formValues, globals };
        const resolvedUrl = resolvePlaceholdersDeep(config.url, context) as string;
        const resolvedHeaders = config.headers 
          ? resolvePlaceholdersDeep(config.headers, context) as Record<string, string>
          : {};
        const resolvedBody = config.body 
          ? resolvePlaceholdersDeep(config.body, context)
          : undefined;

        // Make the request
        const response = await fetch(resolvedUrl, {
          method: config.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...resolvedHeaders,
          },
          body: resolvedBody ? JSON.stringify(resolvedBody) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch options: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract items from response
        let items = data;
        if (config.itemsPath) {
          items = deepGet(data, config.itemsPath, []);
        }

        if (!Array.isArray(items)) {
          throw new Error('Response does not contain an array of items');
        }

        // Map items to options
        const mappedOptions: StaticOption[] = items.map((item: any) => {
          const label = config.labelKey 
            ? deepGet(item, config.labelKey, '')
            : item.label || item.name || String(item);
          
          const value = config.valueKey
            ? deepGet(item, config.valueKey, '')
            : item.value || item.id || item;

          return { label: String(label), value };
        });

        setOptions(mappedOptions);
      } catch (err: any) {
        // Ignore aborted requests
        if (err.name === 'AbortError') {
          return;
        }
        
        setError(err.message || 'Failed to fetch options');
        setOptions([]);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }, 300);
  }, [config, formValues, globals, enabled]);

  // Refetch function
  const refetch = useCallback(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Effect to fetch options when dependencies change
  useEffect(() => {
    const currentDeps = getDependencyValues();
    
    // Check if dependencies have changed
    if (currentDeps !== prevDepsRef.current) {
      prevDepsRef.current = currentDeps;
      fetchOptions();
    }
  }, [getDependencyValues, fetchOptions]);

  // Initial fetch
  useEffect(() => {
    if (enabled && options.length === 0) {
      fetchOptions();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    options,
    loading,
    error,
    refetch,
  };
}

/**
 * Cache for remote options to avoid redundant fetches
 */
class OptionsCache {
  private cache: Map<string, { options: StaticOption[]; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  getCacheKey(config: RemoteOptionsConfig, context: any): string {
    return JSON.stringify({
      url: config.url,
      method: config.method,
      headers: config.headers,
      body: config.body,
      context,
    });
  }

  get(key: string): StaticOption[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.options;
  }

  set(key: string, options: StaticOption[]): void {
    this.cache.set(key, {
      options,
      timestamp: Date.now(),
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Invalidate entries matching pattern
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

// Global cache instance
export const optionsCache = new OptionsCache();