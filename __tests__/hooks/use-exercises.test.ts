import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useExercises, useExercisesInfinite } from '@/hooks/use-exercises';

// Mock the API
jest.mock('@/lib/api', () => ({
  exercisesApi: {
    getAll: jest.fn(),
  },
}));

import { exercisesApi } from '@/lib/api';

const mockExercisesApi = exercisesApi as jest.Mocked<typeof exercisesApi>;

describe('useExercises', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch exercises successfully', async () => {
    const mockExercises = [
      {
        id: '1',
        name: 'Push-ups',
        category: 'chest',
        difficulty: 'beginner',
      },
      {
        id: '2',
        name: 'Bench Press',
        category: 'chest',
        difficulty: 'intermediate',
      },
    ];

    mockExercisesApi.getAll.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.exercises).toEqual(mockExercises);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to fetch exercises';
    mockExercisesApi.getAll.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useExercises(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.exercises).toEqual([]);
  });

  it('should cache exercises across renders', async () => {
    const mockExercises = [
      { id: '1', name: 'Push-ups', category: 'chest', difficulty: 'beginner' },
    ];

    mockExercisesApi.getAll.mockResolvedValue(mockExercises);

    const { result, rerender } = renderHook(() => useExercises(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstCallCount = mockExercisesApi.getAll.mock.calls.length;

    // Second render should use cache
    rerender();

    // No new API call should be made (cache is fresh for 5 minutes)
    expect(mockExercisesApi.getAll).toHaveBeenCalledTimes(firstCallCount);
  });

  it('should filter exercises correctly', async () => {
    const mockFilteredExercises = [
      { id: '1', name: 'Push-ups', category: 'chest', difficulty: 'beginner' },
    ];

    mockExercisesApi.getAll.mockResolvedValue(mockFilteredExercises);

    const { result } = renderHook(
      () => useExercises({ category: 'chest', difficulty: 'beginner' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockExercisesApi.getAll).toHaveBeenCalledWith({
      category: 'chest',
      difficulty: 'beginner',
    });

    expect(result.current.exercises).toEqual(mockFilteredExercises);
  });

  it('should support manual refetch', async () => {
    const mockExercises = [
      { id: '1', name: 'Push-ups', category: 'chest', difficulty: 'beginner' },
    ];

    mockExercisesApi.getAll.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCallCount = mockExercisesApi.getAll.mock.calls.length;

    // Manual refetch
    result.current.refetch();

    await waitFor(() => {
      // New API call should be made
      expect(mockExercisesApi.getAll).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });
});

describe('useExercisesInfinite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch first page of exercises', async () => {
    const mockResponse = {
      data: [
        { id: '1', name: 'Push-ups', category: 'chest', difficulty: 'beginner' },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        pages: 5,
        hasMore: true,
      },
    };

    mockExercisesApi.getAll.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useExercisesInfinite(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.exercises).toEqual(mockResponse.data);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should fetch next page on demand', async () => {
    const page1 = {
      data: [{ id: '1', name: 'Push-ups', category: 'chest', difficulty: 'beginner' }],
      pagination: { page: 1, limit: 20, total: 100, pages: 5, hasMore: true },
    };

    const page2 = {
      data: [{ id: '21', name: 'Bench Press', category: 'chest', difficulty: 'intermediate' }],
      pagination: { page: 2, limit: 20, total: 100, pages: 5, hasMore: true },
    };

    mockExercisesApi.getAll
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const { result } = renderHook(() => useExercisesInfinite(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.exercises).toEqual(page1.data);

    // Fetch next page
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.exercises).toEqual([...page1.data, ...page2.data]);
    });
  });

  it('should indicate when there are no more pages', async () => {
    const lastPage = {
      data: [{ id: '81', name: 'Exercise', category: 'chest', difficulty: 'advanced' }],
      pagination: { page: 5, limit: 20, total: 100, pages: 5, hasMore: false },
    };

    mockExercisesApi.getAll.mockResolvedValue(lastPage);

    const { result } = renderHook(() => useExercisesInfinite(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(false);
  });
});
