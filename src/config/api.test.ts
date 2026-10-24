import { describe, it, expect } from "vitest"
import {
  API_BASE_URL,
  API_ENDPOINTS,
  DEFAULT_PAGINATION,
} from "./api"

describe("API Configuration", () => {
  it("should export API_BASE_URL", () => {
    expect(API_BASE_URL).toBeDefined()
    expect(typeof API_BASE_URL).toBe("string")
  })

  describe("API_ENDPOINTS", () => {
    it("should have correct contacts endpoints", () => {
      expect(API_ENDPOINTS.contacts.base).toBe("/api/contacts")
      expect(API_ENDPOINTS.contacts.count).toBe("/api/contacts/count")
      expect(API_ENDPOINTS.contacts.create).toBe("/api/contacts")
    })

    it("should generate getAll endpoint with pagination", () => {
      expect(API_ENDPOINTS.contacts.getAll(1, 50)).toBe("/api/contacts?page=1&limit=50")
      expect(API_ENDPOINTS.contacts.getAll(2, 25)).toBe("/api/contacts?page=2&limit=25")
    })

    it("should generate getById endpoint", () => {
      expect(API_ENDPOINTS.contacts.getById("123")).toBe("/api/contacts/123")
    })

    it("should generate update endpoint", () => {
      expect(API_ENDPOINTS.contacts.update("123")).toBe("/api/contacts/123")
    })

    it("should generate delete endpoint", () => {
      expect(API_ENDPOINTS.contacts.delete("123")).toBe("/api/contacts/123")
    })

    it("should generate searchByName endpoint with encoding", () => {
      const endpoint = API_ENDPOINTS.contacts.searchByName("John Doe", 1, 50)
      expect(endpoint).toContain("query=John%20Doe")
      expect(endpoint).toContain("page=1")
      expect(endpoint).toContain("limit=50")
    })

    it("should generate searchByPhone endpoint", () => {
      const endpoint = API_ENDPOINTS.contacts.searchByPhone("+919398263414")
      expect(endpoint).toContain("query=%2B919398263414")
    })

    it("should generate getByBloodGroup endpoint with parameters", () => {
      const endpoint = API_ENDPOINTS.contacts.getByBloodGroup(["A+", "B+"], ["Lobby1"], 1, 50)
      expect(endpoint).toContain("bloodGroup=A%2B%2CB%2B")
      expect(endpoint).toContain("lobby=Lobby1")
      expect(endpoint).toContain("page=1")
      expect(endpoint).toContain("limit=50")
    })

    it("should generate getByBloodGroup endpoint with only blood groups", () => {
      const endpoint = API_ENDPOINTS.contacts.getByBloodGroup(["A+"], [], 1, 50)
      expect(endpoint).toContain("bloodGroup=A%2B")
      expect(endpoint).not.toContain("lobby=")
    })

    it("should generate getByLobby endpoint with parameters", () => {
      const endpoint = API_ENDPOINTS.contacts.getByLobby(["Lobby1"], ["Manager"], 1, 50)
      expect(endpoint).toContain("lobby=Lobby1")
      expect(endpoint).toContain("designation=Manager")
    })

    it("should generate filter endpoint with all parameters", () => {
      const endpoint = API_ENDPOINTS.contacts.filter(["A+"], ["Lobby1"], ["Manager"], 1, 50)
      expect(endpoint).toContain("bloodGroup=A%2B")
      expect(endpoint).toContain("lobby=Lobby1")
      expect(endpoint).toContain("designation=Manager")
    })

    it("should have correct analytics endpoints", () => {
      expect(API_ENDPOINTS.analytics.visits.increment).toBe("/api/analytics/visits")
      expect(API_ENDPOINTS.analytics.visits.get).toBe("/api/analytics/visits")
      expect(API_ENDPOINTS.analytics.overview).toBe("/api/analytics/overview")
      expect(API_ENDPOINTS.analytics.bloodGroups).toBe("/api/analytics/blood-groups")
      expect(API_ENDPOINTS.analytics.lobbies).toBe("/api/analytics/lobbies")
      expect(API_ENDPOINTS.analytics.designations).toBe("/api/analytics/designations")
    })

    it("should generate analytics history endpoint", () => {
      expect(API_ENDPOINTS.analytics.visits.history(30)).toBe("/api/analytics/visits/history?days=30")
      expect(API_ENDPOINTS.analytics.visits.history(7)).toBe("/api/analytics/visits/history?days=7")
    })

    it("should generate growth endpoint", () => {
      expect(API_ENDPOINTS.analytics.growth(30)).toBe("/api/analytics/growth?days=30")
      expect(API_ENDPOINTS.analytics.growth(7)).toBe("/api/analytics/growth?days=7")
    })

    it("should generate recent endpoint", () => {
      expect(API_ENDPOINTS.analytics.recent(10)).toBe("/api/analytics/recent?limit=10")
      expect(API_ENDPOINTS.analytics.recent(100)).toBe("/api/analytics/recent?limit=100")
    })

    it("should have correct documents endpoints", () => {
      expect(API_ENDPOINTS.documents.getAll).toBe("/api/documents/all")
      expect(API_ENDPOINTS.documents.count).toBe("/api/documents/count")
    })
  })

  describe("DEFAULT_PAGINATION", () => {
    it("should have correct default pagination values", () => {
      expect(DEFAULT_PAGINATION.page).toBe(1)
      expect(DEFAULT_PAGINATION.limit).toBe(50)
    })
  })
})

