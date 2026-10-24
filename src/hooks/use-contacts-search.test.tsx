import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useContactsSearch } from "./use-contacts-search"
import { contactsService } from "@/services/contacts.service"
import { ApiError } from "@/lib/api-client"

vi.mock("@/services/contacts.service")

describe("useContactsSearch", () => {
  const mockContactsService = vi.mocked(contactsService)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("initial state", () => {
    it("should have empty initial state", () => {
      const { result } = renderHook(() => useContactsSearch())

      expect(result.current.contacts).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.pagination).toBeNull()
    })
  })

  describe("searchByName", () => {
    it("should search contacts by name successfully", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "1", name: "John Doe", phone: "1234567890" }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      }

      mockContactsService.searchByName.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByName("John")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.contacts).toEqual(mockResponse.data)
      })
      expect(result.current.pagination).toEqual(mockResponse.pagination)
      expect(result.current.error).toBeNull()
      expect(mockContactsService.searchByName).toHaveBeenCalledWith("John", 1, 50, expect.any(AbortSignal))
    })

    it("should search with custom page", async () => {
      const mockResponse = {
        success: true,
        data: [],
        pagination: {
          page: 2,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      }

      mockContactsService.searchByName.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useContactsSearch())

      await result.current.searchByName("John", 2)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockContactsService.searchByName).toHaveBeenCalledWith("John", 2, 50, expect.any(AbortSignal))
    })

    it("should handle validation errors", async () => {
      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByName("")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe("Search query is required")
      })

      expect(result.current.contacts).toEqual([])
    })

    it("should handle query too long", async () => {
      const { result } = renderHook(() => useContactsSearch())

      const longQuery = "a".repeat(101)
      result.current.searchByName(longQuery)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeTruthy()
        expect(result.current.error).toContain("100 characters")
      })
    })

    it("should handle invalid characters", async () => {
      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByName("John@#$")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeTruthy()
        expect(result.current.error).toContain("Invalid characters")
      })
    })

    it("should handle API errors", async () => {
      const error = new ApiError("Not found", 404)
      mockContactsService.searchByName.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByName("John")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe("Not found")
      })

      expect(result.current.contacts).toEqual([])
    })

    it("should handle non-ApiError errors", async () => {
      const error = new Error("Network error")
      mockContactsService.searchByName.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByName("John")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(
          "Failed to search contacts. Please try again."
        )
      })
    })

    it("should handle race conditions", async () => {
      const mockResponse1 = {
        success: true,
        data: [{ id: "1", name: "John" }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      }

      const mockResponse2 = {
        success: true,
        data: [{ id: "2", name: "Jane" }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      }

      mockContactsService.searchByName
        .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(mockResponse1), 100)))
        .mockResolvedValueOnce(mockResponse2)

      const { result } = renderHook(() => useContactsSearch())

      const promise1 = result.current.searchByName("John")
      const promise2 = result.current.searchByName("Jane")

      await Promise.all([promise1, promise2])

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have the result from the last request
      expect(result.current.contacts).toEqual(mockResponse2.data)
    })
  })

  describe("searchByPhone", () => {
    it("should search contacts by phone successfully", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "1", name: "John Doe", phone: "1234567890" }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      }

      mockContactsService.searchByPhone.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useContactsSearch())

      await       result.current.searchByPhone("1234567890")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.contacts).toEqual(mockResponse.data)
      })
      expect(result.current.pagination).toEqual(mockResponse.pagination)
      expect(result.current.error).toBeNull()
      expect(mockContactsService.searchByPhone).toHaveBeenCalledWith("1234567890", expect.any(AbortSignal))
    })

    it("should handle validation errors", async () => {
      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByPhone("")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe("Phone number is required")
      })
    })

    it("should handle phone too long", async () => {
      const { result } = renderHook(() => useContactsSearch())

      const longPhone = "1".repeat(21)
      result.current.searchByPhone(longPhone)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeTruthy()
        expect(result.current.error).toContain("20 characters")
      })
    })

    it("should handle invalid phone format", async () => {
      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByPhone("abc123")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeTruthy()
        expect(result.current.error).toContain("Invalid phone number format")
      })
    })

    it("should handle 404 errors with custom message", async () => {
      const error = new ApiError("Not found", 404)
      mockContactsService.searchByPhone.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByPhone("1234567890")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe("Contact not found")
      })
    })

    it("should handle other API errors", async () => {
      const error = new ApiError("Server error", 500)
      mockContactsService.searchByPhone.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useContactsSearch())

      result.current.searchByPhone("1234567890")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe("Server error")
      })
    })

    it("should handle race conditions", async () => {
      const mockResponse1 = {
        success: true,
        data: [{ id: "1", name: "John", phone: "111" }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      }

      const mockResponse2 = {
        success: true,
        data: [{ id: "2", name: "Jane", phone: "222" }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      }

      mockContactsService.searchByPhone
        .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(mockResponse1), 100)))
        .mockResolvedValueOnce(mockResponse2)

      const { result } = renderHook(() => useContactsSearch())

      const promise1 = result.current.searchByPhone("111")
      const promise2 = result.current.searchByPhone("222")

      await Promise.all([promise1, promise2])

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.contacts).toEqual(mockResponse2.data)
    })
  })

  describe("clearResults", () => {
    it("should clear search results", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "1", name: "John" }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      }

      mockContactsService.searchByName.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useContactsSearch())

      await result.current.searchByName("John")

      await waitFor(() => {
        expect(result.current.contacts.length).toBeGreaterThan(0)
      })

      result.current.clearResults()

      await waitFor(() => {
        expect(result.current.contacts).toEqual([])
      })
      expect(result.current.error).toBeNull()
      expect(result.current.pagination).toBeNull()
    })
  })
})

