/**
 * Phone Number Utilities
 * Auto-format and validate Indonesian phone numbers for import
 */

export interface PhoneValidationResult {
  valid: boolean
  formatted: string
  original: string
  error?: string
  wasFormatted: boolean
}

/**
 * Normalize phone number to +62 format
 * Handles multiple input formats:
 * - 08xxx → +628xxx
 * - 8xxx → +628xxx
 * - 628xxx → +628xxx
 * - 62xxx → +62xxx
 * - Removes spaces, dashes, parentheses
 */
export const normalizePhoneNumber = (phone: string | number): string => {
  if (!phone) return ''

  // Step 1: Convert to string and trim
  let cleaned = String(phone).trim()

  // Step 2: Remove all whitespace, dashes, parentheses, dots
  cleaned = cleaned.replace(/[\s\-().]/g, '')

  // Step 3: Apply transformation rules

  // Rule 1: 08xxxxxxxxx → +628xxxxxxxxx (most common Indonesian format)
  if (/^08\d+/.test(cleaned)) {
    return cleaned.replace(/^08/, '+628')
  }

  // Rule 2: 8xxxxxxxxx → +628xxxxxxxxx (missing leading 0)
  if (/^8\d+/.test(cleaned)) {
    return '+62' + cleaned
  }

  // Rule 3: 628xxxxxxxxx → +628xxxxxxxxx (missing +, starts with 8)
  if (/^628\d+/.test(cleaned)) {
    return '+' + cleaned
  }

  // Rule 4: 62xxxxxxxxx → +62xxxxxxxxx (missing +, any digits)
  if (/^62\d+/.test(cleaned)) {
    return '+' + cleaned
  }

  // Rule 5: +62xxxxxxxxx → +62xxxxxxxxx (already correct)
  if (/^\+62\d+/.test(cleaned)) {
    return cleaned
  }

  // Rule 6: If none of the above, return cleaned version
  return cleaned
}

/**
 * Validate Indonesian phone number format
 */
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' }
  }

  if (!phone.startsWith('+62')) {
    return { valid: false, error: 'Must be Indonesian number (+62)' }
  }

  // Extract digits only
  const digits = phone.replace(/\D/g, '')

  // Should be: 62 + 9-13 digits = 11-15 total digits
  if (digits.length < 11) {
    return { valid: false, error: 'Phone number too short (min 9 digits after +62)' }
  }

  if (digits.length > 15) {
    return { valid: false, error: 'Phone number too long (max 13 digits after +62)' }
  }

  // Check if starts with valid prefix after +62 (should be 8)
  const afterPrefix = phone.substring(3) // Remove +62
  if (!/^8\d+/.test(afterPrefix)) {
    return { valid: false, error: 'Indonesian mobile numbers should start with 8 after +62' }
  }

  return { valid: true }
}

/**
 * Complete phone number validation with auto-format
 * Returns formatted number and validation result
 */
export const validateAndFormatPhone = (phone: string | number): PhoneValidationResult => {
  const original = String(phone || '')
  const formatted = normalizePhoneNumber(phone)
  const wasFormatted = original.trim() !== formatted

  const validation = validatePhoneNumber(formatted)

  return {
    valid: validation.valid,
    formatted,
    original,
    error: validation.error,
    wasFormatted
  }
}
