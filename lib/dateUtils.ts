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
    if (!trimmed) return '';

    // If already in DD/MM/YYYY format, preserve it (ensuring 2-digit padding for day and month)
    const ddmmyyyyMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (ddmmyyyyMatch) {
      const [, dd, mm, yyyy] = ddmmyyyyMatch;
      return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
    }

    // If in DD-MM-YYYY format
    const ddmmyyyyDashMatch = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(trimmed);
    if (ddmmyyyyDashMatch) {
      const [, dd, mm, yyyy] = ddmmyyyyDashMatch;
      return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
    }

    // Match YYYY-MM-DD (including ISO timestamps like YYYY-MM-DDTHH:mm:ss or YYYY-MM-DD HH:mm:ss)
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (isoMatch) {
      const [, yyyy, mm, dd] = isoMatch;
      return `${dd}/${mm}/${yyyy}`;
    }
  }

  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
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
  const trimmed = dateStr.trim();
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return trimmed;
}
