# Workspace Guidelines & Project Rules

## Date Input and Display Standards
- **Date Inputs**: ALL date and datetime input fields (`<input type="date">`, `<input type="datetime-local">`, etc.) MUST specify `lang="en-GB"` and `placeholder="dd/mm/yyyy"` (or `dd/mm/yyyy hh:mm`) to ensure web browsers use the `DD/MM/YYYY` date format.
- **Form Labels & Hints**: Date input labels must explicitly indicate `(DD/MM/YYYY)` (e.g. `Date (DD/MM/YYYY)` or `Tarikh (DD/MM/YYYY)`).
- **Date Formatting**: All date displays, tables, receipts, PDFs, and views must format dates in `DD/MM/YYYY` format using `formatDateToDDMMYYYY` or `en-GB` / `en-MY` locale formatting.
