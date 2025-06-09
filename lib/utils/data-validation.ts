/**
 * Validates and sanitizes numerical data to prevent NaN values
 * @param value The value to validate
 * @param defaultValue The default value to return if invalid
 * @returns A valid number
 */
export function validateNumber(value: any, defaultValue = 0): number {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

/**
 * Safely calculates an average from an array of values
 * @param values Array of values to average
 * @param defaultValue Default value if calculation fails
 * @returns The calculated average or default value
 */
export function safeAverage(values: any[], defaultValue = 0): number {
  if (!values || values.length === 0) return defaultValue

  const validValues = values.map((v) => validateNumber(v)).filter((v) => v !== 0)

  if (validValues.length === 0) return defaultValue

  const sum = validValues.reduce((acc, val) => acc + val, 0)
  return sum / validValues.length
}

/**
 * Formats a number to a specified precision with fallback
 * @param value The value to format
 * @param precision Number of decimal places
 * @param defaultValue Default value if formatting fails
 * @returns Formatted number string
 */
export function formatNumber(value: any, precision = 2, defaultValue = "0"): string {
  const num = validateNumber(value)
  try {
    return num.toFixed(precision)
  } catch (error) {
    return defaultValue
  }
}

/**
 * Safely retrieves a property from an object with type checking
 * @param obj The object to retrieve from
 * @param key The property key
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default
 */
export function safeGet<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || typeof obj !== "object") return defaultValue
  return obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultValue
}
