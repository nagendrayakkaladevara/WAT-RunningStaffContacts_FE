/**
 * Contacts Service
 * Service layer for contacts-related API operations
 */

import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS, DEFAULT_PAGINATION } from "@/config/api"
import type {
  Contact,
  PaginatedContactsResponse,
  ContactsCountResponse,
} from "@/types/contact"

/**
 * Contacts Service Class
 * Provides methods for all contact-related operations
 */
export class ContactsService {
  /**
   * Get total contacts count
   */
  async getContactsCount(): Promise<number> {
    const response = await apiClient.get<ContactsCountResponse>(
      API_ENDPOINTS.contacts.count
    )
    return response.count
  }

  /**
   * Get all contacts with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   */
  async getAllContacts(
    page: number = DEFAULT_PAGINATION.page,
    limit: number = DEFAULT_PAGINATION.limit,
    signal?: AbortSignal
  ): Promise<PaginatedContactsResponse> {
    const endpoint = API_ENDPOINTS.contacts.getAll(page, limit)
    return signal ? apiClient.get<PaginatedContactsResponse>(endpoint, { signal }) : apiClient.get<PaginatedContactsResponse>(endpoint)
  }

  /**
   * Get contact by ID
   */
  async getContactById(id: string, signal?: AbortSignal): Promise<Contact> {
    const endpoint = API_ENDPOINTS.contacts.getById(id)
    return signal ? apiClient.get<Contact>(endpoint, { signal }) : apiClient.get<Contact>(endpoint)
  }

  /**
   * Create a new contact
   */
  async createContact(contact: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact> {
    return apiClient.post<Contact>(API_ENDPOINTS.contacts.create, contact)
  }

  /**
   * Update an existing contact
   */
  async updateContact(
    id: string,
    contact: Partial<Omit<Contact, "id" | "createdAt" | "updatedAt">>
  ): Promise<Contact> {
    const endpoint = API_ENDPOINTS.contacts.update(id)
    return apiClient.put<Contact>(endpoint, contact)
  }

  /**
   * Delete a contact
   */
  async deleteContact(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.contacts.delete(id)
    await apiClient.delete<void>(endpoint)
  }

  /**
   * Search contacts by name
   * @param query - Search query string
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   */
  async searchByName(
    query: string,
    page: number = DEFAULT_PAGINATION.page,
    limit: number = DEFAULT_PAGINATION.limit,
    signal?: AbortSignal
  ): Promise<PaginatedContactsResponse> {
    const endpoint = API_ENDPOINTS.contacts.searchByName(query, page, limit)
    return signal ? apiClient.get<PaginatedContactsResponse>(endpoint, { signal }) : apiClient.get<PaginatedContactsResponse>(endpoint)
  }

  /**
   * Search contact by phone number
   * @param phone - Phone number to search
   */
  async searchByPhone(phone: string, signal?: AbortSignal): Promise<PaginatedContactsResponse> {
    const endpoint = API_ENDPOINTS.contacts.searchByPhone(phone)
    const response = await apiClient.get<Partial<PaginatedContactsResponse> & { count?: number; limit?: number; page?: number }>(endpoint, ...(signal ? [{ signal }] : []))
    
    // Handle API response format that might have 'count' instead of 'pagination'
    if (response && 'count' in response && !('pagination' in response)) {
      const count = response.count || 0
      const data = response.data || []
      const limit = response.limit || 50 // Use limit from response if available, default to 50
      const page = response.page || 1 // Use page from response if available, default to 1
      
      return {
        success: response.success !== false,
        data: data,
        pagination: {
          page: page,
          limit: limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        }
      }
    }
    
    // If response already has pagination, return as is
    if (response && 'pagination' in response) {
      return response as PaginatedContactsResponse
    }
    
    // Fallback: transform to expected format
    return {
      success: response?.success !== false,
      data: response?.data || [],
      pagination: {
        page: 1,
        limit: 50,
        total: response?.data?.length || 0,
        totalPages: 1,
      }
    }
  }

  /**
   * Get all blood groups
   */
  async getBloodGroups(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      API_ENDPOINTS.contacts.getBloodGroups
    )
    return response.data
  }

  /**
   * Get contacts by blood group(s) and/or lobby/lobbies
   * @param bloodGroups - Array of blood groups (e.g., ["A+", "B+"])
   * @param lobbies - Array of lobbies (e.g., ["Engineering", "Sales"])
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   * @throws Error if both bloodGroups and lobbies are empty
   */
  async getContactsByBloodGroup(
    bloodGroups: string[] = [],
    lobbies: string[] = [],
    page: number = DEFAULT_PAGINATION.page,
    limit: number = DEFAULT_PAGINATION.limit,
    signal?: AbortSignal
  ): Promise<PaginatedContactsResponse> {
    if (bloodGroups.length === 0 && lobbies.length === 0) {
      throw new Error("At least one blood group or lobby is required")
    }
    const endpoint = API_ENDPOINTS.contacts.getByBloodGroup(bloodGroups, lobbies, page, limit)
    return signal ? apiClient.get<PaginatedContactsResponse>(endpoint, { signal }) : apiClient.get<PaginatedContactsResponse>(endpoint)
  }

  /**
   * Get all lobbies
   */
  async getLobbies(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      API_ENDPOINTS.contacts.getLobbies
    )
    return response.data
  }

  /**
   * Get all designations
   */
  async getDesignations(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      API_ENDPOINTS.contacts.getDesignations
    )
    return response.data
  }

  /**
   * Get contacts by lobby/lobbies and/or designation(s)
   * @param lobbies - Array of lobbies (e.g., ["Engineering", "Sales"])
   * @param designations - Array of designations (e.g., ["Manager", "Developer"])
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   * @throws Error if both lobbies and designations are empty
   */
  async getContactsByLobby(
    lobbies: string[] = [],
    designations: string[] = [],
    page: number = DEFAULT_PAGINATION.page,
    limit: number = DEFAULT_PAGINATION.limit,
    signal?: AbortSignal
  ): Promise<PaginatedContactsResponse> {
    if (lobbies.length === 0 && designations.length === 0) {
      throw new Error("At least one lobby or designation is required")
    }
    const endpoint = API_ENDPOINTS.contacts.getByLobby(lobbies, designations, page, limit)
    return signal ? apiClient.get<PaginatedContactsResponse>(endpoint, { signal }) : apiClient.get<PaginatedContactsResponse>(endpoint)
  }

  /**
   * Unified filter for contacts by blood group, lobby, and/or designation
   * @param bloodGroups - Array of blood groups (e.g., ["A+", "B+"])
   * @param lobbies - Array of lobbies (e.g., ["Engineering", "Sales"])
   * @param designations - Array of designations (e.g., ["Manager", "Developer"])
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   * @throws Error if all filters are empty
   */
  async filterContacts(
    bloodGroups: string[] = [],
    lobbies: string[] = [],
    designations: string[] = [],
    page: number = DEFAULT_PAGINATION.page,
    limit: number = DEFAULT_PAGINATION.limit,
    signal?: AbortSignal
  ): Promise<PaginatedContactsResponse> {
    if (bloodGroups.length === 0 && lobbies.length === 0 && designations.length === 0) {
      throw new Error("At least one filter (bloodGroup, lobby, or designation) is required")
    }
    const endpoint = API_ENDPOINTS.contacts.filter(bloodGroups, lobbies, designations, page, limit)
    return signal ? apiClient.get<PaginatedContactsResponse>(endpoint, { signal }) : apiClient.get<PaginatedContactsResponse>(endpoint)
  }
}

// Export singleton instance
export const contactsService = new ContactsService()

