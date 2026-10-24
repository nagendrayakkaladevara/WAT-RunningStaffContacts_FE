/**
 * Documents Service
 * Service layer for documents-related API operations
 */

import type { Document } from "@/types/document"
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api"

/**
 * Documents Service Class
 * Provides methods for all document-related operations
 */
export class DocumentsService {
  /**
   * Get all documents (no pagination)
   */
  async getDocuments(): Promise<Document[]> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      // Build headers with X-API-Key and Basic Auth
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const url = `${API_BASE_URL}${API_ENDPOINTS.documents.getAll}`
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Handle wrapped response format: { success: true, data: [...], count: number }
      if (responseData && typeof responseData === "object" && "data" in responseData) {
        const documents = (Array.isArray(responseData.data) ? responseData.data : [])
          .map((doc: Partial<Document>) => ({
            id: doc.id || "",
            title: doc.title || "",
            link: doc.link || "",
            uploadedBy: doc.uploadedBy || "",
            createdAt: doc.createdAt || "",
            updatedAt: doc.updatedAt || "",
          }))
        return documents
      }

      // Fallback: handle direct array response
      const documents = (Array.isArray(responseData) ? responseData : [])
        .map((doc: Partial<Document>) => ({
          id: doc.id || "",
          title: doc.title || "",
          link: doc.link || "",
          uploadedBy: doc.uploadedBy || "",
          createdAt: doc.createdAt || "",
          updatedAt: doc.updatedAt || "",
        }))

      return documents
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout: Could not fetch documents")
      }
      throw error
    }
  }

  /**
   * Get total count of documents
   */
  async getDocumentsCount(): Promise<number> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      // Build headers with X-API-Key and Basic Auth
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const url = `${API_BASE_URL}${API_ENDPOINTS.documents.count}`
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to fetch documents count: ${response.statusText}`)
      }

      const responseData = await response.json()
      
      // Handle wrapped response format: { success: true, count: number }
      if (responseData && typeof responseData === "object" && "count" in responseData) {
        if (typeof responseData.count === "number") {
          return responseData.count
        }
      }
      
      // Fallback: handle direct number response
      if (typeof responseData === "number") {
        return responseData
      }
      
      // Fallback: handle alternative field names
      if (responseData && typeof responseData.total === "number") {
        return responseData.total
      }
      
      throw new Error("Invalid response format for documents count")
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout: Could not fetch documents count")
      }
      throw error
    }
  }
}

// Export singleton instance
export const documentsService = new DocumentsService()

