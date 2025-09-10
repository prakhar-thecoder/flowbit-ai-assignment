# API Documentation

Base URL: the deployed API URL.

## Endpoints

- POST `/upload`
  - form-data: `{ file }`
  - returns: `{ fileId, fileName }`

- POST `/extract`
  - body: `{ fileId: string, model: "gemini" }`
  - returns: extracted JSON matching the minimal data shape

- GET `/invoices`
  - optional query: `?q=searchTerm` (matches vendor name or invoice number)
  - returns: list of invoices

- GET `/invoices/:id`
  - returns: invoice by id

- POST `/invoices`
  - body: minimal data shape; only `vendor.name` and `invoice.number` are required

- PUT `/invoices/:id`
  - body: any subset to update

- DELETE `/invoices/:id`
  - deletes invoice by id

- GET `/files/:id`
  - streams the original PDF from GridFS for download

## Minimal Data Shape
```
{
  fileId: string,
  fileName: string,
  vendor: { name: string, address?: string, taxId?: string },
  invoice: {
    number: string,
    date: string,
    currency?: string,
    subtotal?: number,
    taxPercent?: number,
    total?: number,
    poNumber?: string,
    poDate?: string,
    lineItems: Array<{ description: string, unitPrice: number, quantity: number, total: number }>
  },
  createdAt: string,
  updatedAt?: string
}
```


