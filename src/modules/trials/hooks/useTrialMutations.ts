import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trial, CreateTrialInput, UpdateTrialInput, TrialEvaluationInput } from '../types/trial'

interface TrialResponse {
  success: boolean
  data: Trial
  message?: string
}

// Create trial mutation
export function useCreateTrial(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trialData: CreateTrialInput): Promise<Trial> => {
      const response = await fetch(`/api/trials?tenant=${tenantSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trialData)
      })

      const result: TrialResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to create trial')
      }

      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch trials
      queryClient.invalidateQueries({ queryKey: ['trials', tenantSlug] })
    }
  })
}

// Update trial mutation
export function useUpdateTrial(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ trialId, data }: { trialId: string; data: UpdateTrialInput }): Promise<Trial> => {
      const response = await fetch(`/api/trials/${trialId}?tenant=${tenantSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result: TrialResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to update trial')
      }

      return result.data
    },
    onSuccess: (updatedTrial) => {
      // Invalidate trials list
      queryClient.invalidateQueries({ queryKey: ['trials', tenantSlug] })
      // Update single trial cache
      queryClient.setQueryData(['trial', updatedTrial.id, tenantSlug], updatedTrial)
    }
  })
}

// Delete trial mutation
export function useDeleteTrial(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trialId: string): Promise<void> => {
      const response = await fetch(`/api/trials/${trialId}?tenant=${tenantSlug}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete trial')
      }
    },
    onSuccess: (_, trialId) => {
      // Invalidate trials list
      queryClient.invalidateQueries({ queryKey: ['trials', tenantSlug] })
      // Remove single trial from cache
      queryClient.removeQueries({ queryKey: ['trial', trialId, tenantSlug] })
    }
  })
}

// Evaluate trial mutation
export function useEvaluateTrial(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ trialId, evaluation }: { trialId: string; evaluation: TrialEvaluationInput }): Promise<Trial> => {
      const response = await fetch(`/api/trials/${trialId}/evaluate?tenant=${tenantSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluation)
      })

      const result: TrialResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to evaluate trial')
      }

      return result.data
    },
    onSuccess: (updatedTrial) => {
      // Invalidate trials list
      queryClient.invalidateQueries({ queryKey: ['trials', tenantSlug] })
      // Update single trial cache
      queryClient.setQueryData(['trial', updatedTrial.id, tenantSlug], updatedTrial)
    }
  })
}

// Bulk update trial status (useful for batch operations)
export function useUpdateTrialStatus(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ trialId, status }: { trialId: string; status: Trial['status'] }): Promise<Trial> => {
      const response = await fetch(`/api/trials/${trialId}?tenant=${tenantSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const result: TrialResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to update trial status')
      }

      return result.data
    },
    onSuccess: (updatedTrial) => {
      // Invalidate trials list
      queryClient.invalidateQueries({ queryKey: ['trials', tenantSlug] })
      // Update single trial cache
      queryClient.setQueryData(['trial', updatedTrial.id, tenantSlug], updatedTrial)
    }
  })
}