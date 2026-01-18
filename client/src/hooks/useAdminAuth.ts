import { useQuery } from "@tanstack/react-query";

interface AdminCheckResponse {
  authenticated: boolean;
  admin?: {
    id: string;
    username: string;
  };
}

export function useAdminAuth() {
  const { data, isLoading, error } = useQuery<AdminCheckResponse>({
    queryKey: ['/api/admin/check'],
    retry: false,
    staleTime: 0, // Always fresh check
    refetchOnMount: true,
  });

  return {
    isAuthenticated: data?.authenticated || false,
    admin: data?.admin || null,
    isLoading,
    error,
  };
}