/** Same-origin Netlify proxy. Secrets belong in server environment variables. */
export const API_BASE_URL = ""

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  contacts: {
    base: "/api/contacts",
    count: "/api/contacts/count",
    getAll: (page: number = 1, limit: number = 50) =>
      `/api/contacts?page=${page}&limit=${limit}`,
    getById: (id: string) => `/api/contacts/${id}`,
    create: "/api/contacts",
    update: (id: string) => `/api/contacts/${id}`,
    delete: (id: string) => `/api/contacts/${id}`,
    searchByName: (query: string, page: number = 1, limit: number = 50) =>
      `/api/contacts/search/name?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    searchByPhone: (phone: string) =>
      `/api/contacts/search/phone?query=${encodeURIComponent(phone)}`,
    getBloodGroups: "/api/contacts/blood-groups",
    getByBloodGroup: (
      bloodGroups: string[] = [],
      lobbies: string[] = [],
      page: number = 1,
      limit: number = 50
    ) => {
      const params = new URLSearchParams()
      if (bloodGroups.length > 0) {
        params.append("bloodGroup", bloodGroups.join(","))
      }
      if (lobbies.length > 0) {
        params.append("lobby", lobbies.join(","))
      }
      params.append("page", page.toString())
      params.append("limit", limit.toString())
      return `/api/contacts/by-blood-group?${params.toString()}`
    },
    getLobbies: "/api/contacts/lobbies",
    getDesignations: "/api/contacts/designations",
    getByLobby: (
      lobbies: string[] = [],
      designations: string[] = [],
      page: number = 1,
      limit: number = 50
    ) => {
      const params = new URLSearchParams()
      if (lobbies.length > 0) {
        params.append("lobby", lobbies.join(","))
      }
      if (designations.length > 0) {
        params.append("designation", designations.join(","))
      }
      params.append("page", page.toString())
      params.append("limit", limit.toString())
      return `/api/contacts/by-lobby?${params.toString()}`
    },
    filter: (
      bloodGroups: string[] = [],
      lobbies: string[] = [],
      designations: string[] = [],
      page: number = 1,
      limit: number = 50
    ) => {
      const params = new URLSearchParams()
      if (bloodGroups.length > 0) {
        params.append("bloodGroup", bloodGroups.join(","))
      }
      if (lobbies.length > 0) {
        params.append("lobby", lobbies.join(","))
      }
      if (designations.length > 0) {
        params.append("designation", designations.join(","))
      }
      params.append("page", page.toString())
      params.append("limit", limit.toString())
      return `/api/contacts/filter?${params.toString()}`
    },
  },
  analytics: {
    visits: {
      increment: "/api/analytics/visits",
      get: "/api/analytics/visits",
      history: (days: number = 30) => `/api/analytics/visits/history?days=${days}`,
    },
    overview: "/api/analytics/overview",
    bloodGroups: "/api/analytics/blood-groups",
    lobbies: "/api/analytics/lobbies",
    designations: "/api/analytics/designations",
    growth: (days: number = 30) => `/api/analytics/growth?days=${days}`,
    recent: (limit: number = 10) => `/api/analytics/recent?limit=${limit}`,
  },
  documents: {
    getAll: "/api/documents/all",
    count: "/api/documents/count",
  },
} as const

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50,
} as const

