import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  positions: any[];
  stats?: {
    totalValue: number;
    totalCost: number;
    totalPositions: number;
    profitLoss: number;
    profitLossPercentage: number;
  };
}

interface CreatePortfolioData {
  name: string;
  description?: string;
}

interface UpdatePortfolioData {
  name?: string;
  description?: string;
}

export function usePortfolios() {
  return useQuery<Portfolio[]>({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const response = await fetch('/api/portfolios');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      return response.json();
    },
  });
}

export function usePortfolio(id: string, withStats = false) {
  return useQuery<Portfolio>({
    queryKey: ['portfolio', id, withStats],
    queryFn: async () => {
      const url = withStats ? `/api/portfolios/${id}?stats=true` : `/api/portfolios/${id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation<Portfolio, Error, CreatePortfolioData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portfolio');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePortfolio(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Portfolio, Error, UpdatePortfolioData>({
    mutationFn: async (data) => {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update portfolio');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] });
      toast.success('Portfolio updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete portfolio');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}