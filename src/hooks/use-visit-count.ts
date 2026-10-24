/**
 * useVisitCount Hook
 * Custom React hook for tracking and fetching visit count
 */

import { useState, useEffect, useCallback } from "react"
import { analyticsService } from "@/services/analytics.service"
import { ApiError } from "@/lib/api-client"

interface UseVisitCountReturn {
  visitCount: number | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for visit count tracking
 * @param autoIncrement - Whether to increment count on mount (default: true)
 * @param autoFetch - Whether to fetch count on mount (default: true)
 */
export function useVisitCount(
  autoIncrement: boolean = true,
  autoFetch: boolean = true
): UseVisitCountReturn {
  const [visitCount, setVisitCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(autoFetch || autoIncrement)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const count = await analyticsService.getVisitCount()
      setVisitCount(count)
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Failed to fetch visit count. Please try again."
      setError(errorMessage)
      setVisitCount(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const incrementCount = useCallback(async () => {
    try {
      const count = await analyticsService.incrementVisitCount()
      setVisitCount(count)
      setError(null)
      setLoading(false)
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Failed to increment visit count. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialize = async () => {
      if (autoIncrement) {
        // Increment already returns the authoritative updated count.
        await incrementCount()
      } else if (autoFetch) {
        // Just fetch without incrementing
        await fetchCount()
      }
    }

    initialize()
  }, [autoIncrement, autoFetch, incrementCount, fetchCount])

  const refetch = useCallback(async () => {
    await fetchCount()
  }, [fetchCount])

  return {
    visitCount,
    loading,
    error,
    refetch,
  }
}







