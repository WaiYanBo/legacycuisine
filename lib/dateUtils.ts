/**
 * Date utility functions enforcing DD/MM/YYYY format across the application.
 */

/**
 * Formats an ISO date string (YYYY-MM-DD), Date object, or timestamp string to DD/MM/YYYY format.
 */
export function formatDateToDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Match YYYY-MM-DD
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (isoMatch) {
      const [, yyyy, mm, dd] = isoMatch;
      return `${dd}/${mm}/${yyyy}`;
    }
  }

  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!isNaN(dateObj.getTime())) {
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  return String(dateInput);
}

/**
 * Parses a DD/MM/YYYY input string back into ISO YYYY-MM-DD format if needed.
 */
export function parseDDMMYYYYToISO(dateStr: string): string {
  if (!dateStr) return '';
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr.trim());
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateStr;
}
