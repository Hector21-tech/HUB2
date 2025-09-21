'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarEvent, CreateEventInput, UpdateEventInput, CalendarEventConflict } from '../types/calendar'

interface FetchEventsParams {
  tenantSlug: string
  start?: string
  end?: string
  type?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  conflicts?: CalendarEventConflict[]
  error?: string
}

// Fetch calendar events
async function fetchCalendarEvents({ tenantSlug, start, end, type }: FetchEventsParams): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({ tenant: tenantSlug })
  if (start) params.append('start', start)
  if (end) params.append('end', end)
  if (type) params.append('type', type)

  const response = await fetch(`/api/calendar/events?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events')
  }

  const result: ApiResponse<CalendarEvent[]> = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch calendar events')
  }

  return result.data
}

// Create calendar event
async function createCalendarEvent(tenantSlug: string, input: CreateEventInput): Promise<{ event: CalendarEvent; conflicts?: CalendarEventConflict[] }> {
  const response = await fetch(`/api/calendar/events?tenant=${tenantSlug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create calendar event')
  }

  const result: ApiResponse<CalendarEvent> = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Failed to create calendar event')
  }

  return {
    event: result.data,
    conflicts: result.conflicts
  }
}

// Update calendar event
async function updateCalendarEvent(input: UpdateEventInput): Promise<CalendarEvent> {
  const { id, ...updateData } = input

  const response = await fetch(`/api/calendar/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update calendar event')
  }

  const result: ApiResponse<CalendarEvent> = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Failed to update calendar event')
  }

  return result.data
}

// Delete calendar event
async function deleteCalendarEvent(id: string): Promise<void> {
  const response = await fetch(`/api/calendar/events/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete calendar event')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete calendar event')
  }
}

// Hook for fetching calendar events
export function useCalendarEvents(params: FetchEventsParams) {
  return useQuery({
    queryKey: ['calendar-events', params.tenantSlug, params],
    queryFn: () => fetchCalendarEvents(params),
    enabled: !!params.tenantSlug,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for creating calendar events
export function useCreateEvent(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEventInput) => createCalendarEvent(tenantSlug, input),
    onSuccess: () => {
      // Invalidate and refetch calendar events
      queryClient.invalidateQueries({ queryKey: ['calendar-events', tenantSlug] })
    }
  })
}

// Hook for updating calendar events
export function useUpdateEvent(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', tenantSlug] })
    }
  })
}

// Hook for deleting calendar events
export function useDeleteEvent(tenantSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', tenantSlug] })
    }
  })
}

// Hook for fetching events within a date range (useful for calendar views)
export function useCalendarEventsInRange(tenantSlug: string, startDate: Date, endDate: Date, type?: string) {
  return useCalendarEvents({
    tenantSlug,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    type
  })
}