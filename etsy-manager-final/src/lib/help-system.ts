// Help system - guided tours and AI fallback

export interface TourStep {
  target: string // CSS selector
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

export interface GuidedTour {
  id: string
  name: string
  keywords: string[]
  steps: TourStep[]
}

// All guided tours for the app
export const guidedTours: GuidedTour[] = [
  {
    id: 'import-orders',
    name: 'How to Import Orders',
    keywords: ['import', 'orders', 'csv', 'etsy', 'add orders', 'upload'],
    steps: [
      {
        target: '[data-tour="nav-orders"]',
        title: 'Go to Orders',
        content: 'First, click on Orders in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="import-btn"]',
        title: 'Click Import Orders',
        content: 'Click this button to open the import dialog.',
        position: 'bottom',
      },
      {
        target: '[data-tour="import-textarea"]',
        title: 'Paste Your CSV Data',
        content: 'Copy the data from your Etsy "Sold Order Items" CSV and paste it here. Include the header row.',
        position: 'top',
      },
      {
        target: '[data-tour="import-submit"]',
        title: 'Click Import',
        content: 'Click Import to process your orders. They will be automatically matched to products.',
        position: 'top',
      },
    ],
  },
  {
    id: 'add-product',
    name: 'How to Add a Product',
    keywords: ['add product', 'new product', 'create product', 'gp id'],
    steps: [
      {
        target: '[data-tour="nav-products"]',
        title: 'Go to Products',
        content: 'Click on Products in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="add-product-btn"]',
        title: 'Click Add Product',
        content: 'Click this button to add a new product.',
        position: 'bottom',
      },
      {
        target: '[data-tour="product-form"]',
        title: 'Fill Product Details',
        content: 'Enter the GP ID (auto-generated), product name, 1688 link if available, and any notes.',
        position: 'left',
      },
    ],
  },
  {
    id: 'add-variant',
    name: 'How to Add a Variant',
    keywords: ['add variant', 'new variant', 'color', 'size', 'cost', 'shipping'],
    steps: [
      {
        target: '[data-tour="nav-products"]',
        title: 'Go to Products',
        content: 'Click on Products in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="product-expand"]',
        title: 'Expand a Product',
        content: 'Click on a product to expand it and see its variants.',
        position: 'bottom',
      },
      {
        target: '[data-tour="add-variant-btn"]',
        title: 'Click Add Variant',
        content: 'Click Add Variant to create a new variant for this product.',
        position: 'left',
      },
      {
        target: '[data-tour="variant-form"]',
        title: 'Fill Variant Details',
        content: 'Enter Etsy color, size, supplier variation name, cost and shipping in USD.',
        position: 'top',
      },
    ],
  },
  {
    id: 'add-store',
    name: 'How to Add a Store',
    keywords: ['add store', 'new store', 'create store', 'etsy store'],
    steps: [
      {
        target: '[data-tour="nav-settings"]',
        title: 'Go to Settings',
        content: 'Click on Settings in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="add-store-btn"]',
        title: 'Click Add Store',
        content: 'Click this to add a new Etsy store.',
        position: 'bottom',
      },
      {
        target: '[data-tour="store-form"]',
        title: 'Fill Store Details',
        content: 'Enter the store name (e.g., "UMER - N - BS - UK - S01"), a short code (e.g., "UMERNBS01"), and optionally the owner.',
        position: 'left',
      },
    ],
  },
  {
    id: 'add-team-member',
    name: 'How to Add a Team Member',
    keywords: ['add user', 'add team', 'invite', 'new member', 'permissions'],
    steps: [
      {
        target: '[data-tour="nav-settings"]',
        title: 'Go to Settings',
        content: 'Click on Settings in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="add-user-btn"]',
        title: 'Click Add User',
        content: 'Click to add a new team member.',
        position: 'bottom',
      },
      {
        target: '[data-tour="user-form"]',
        title: 'Fill User Details',
        content: 'Enter their email, name, and select their role. Each role has different permissions.',
        position: 'left',
      },
    ],
  },
  {
    id: 'view-profit',
    name: 'How to View Profit/PNL',
    keywords: ['profit', 'pnl', 'revenue', 'cost', 'margin', 'finance'],
    steps: [
      {
        target: '[data-tour="nav-finance"]',
        title: 'Go to Finance',
        content: 'Click on Finance & PNL in the sidebar. Note: You need Finance or Admin role to access this.',
        position: 'right',
      },
      {
        target: '[data-tour="finance-summary"]',
        title: 'View Summary',
        content: 'Here you can see total revenue, costs, and net profit.',
        position: 'bottom',
      },
      {
        target: '[data-tour="finance-table"]',
        title: 'View Order Details',
        content: 'The table shows profit breakdown for each order.',
        position: 'top',
      },
    ],
  },
  {
    id: 'resolve-exception',
    name: 'How to Resolve an Exception',
    keywords: ['exception', 'error', 'fix', 'resolve', 'needs fix'],
    steps: [
      {
        target: '[data-tour="nav-exceptions"]',
        title: 'Go to Exceptions',
        content: 'Click on Exceptions in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="exception-item"]',
        title: 'Find the Exception',
        content: 'Each exception shows the order number, issue type, and suggested fix.',
        position: 'bottom',
      },
      {
        target: '[data-tour="exception-resolve"]',
        title: 'Fix and Resolve',
        content: 'After fixing the issue (e.g., adding missing variant), click "Mark Resolved".',
        position: 'left',
      },
    ],
  },
  {
    id: 'supplier-picklist',
    name: 'How to Use Supplier Picklist',
    keywords: ['supplier', 'picklist', 'fulfillment', 'order', '1688'],
    steps: [
      {
        target: '[data-tour="nav-picklist"]',
        title: 'Go to Supplier Picklist',
        content: 'Click on Supplier Picklist in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="picklist-table"]',
        title: 'View Orders to Fulfill',
        content: 'This shows all resolved orders ready for fulfillment with variant details.',
        position: 'bottom',
      },
      {
        target: '[data-tour="picklist-export"]',
        title: 'Export for Supplier',
        content: 'Click Export CSV to download the list for your supplier.',
        position: 'bottom',
      },
    ],
  },
  {
    id: 'map-sku',
    name: 'How to Map a SKU to a Product',
    keywords: ['sku', 'map', 'link', 'connect', 'store sku'],
    steps: [
      {
        target: '[data-tour="nav-products"]',
        title: 'Go to Products',
        content: 'Click on Products in the sidebar.',
        position: 'right',
      },
      {
        target: '[data-tour="product-expand"]',
        title: 'Expand the Product',
        content: 'Click on the product you want to map the SKU to.',
        position: 'bottom',
      },
      {
        target: '[data-tour="sku-mapping"]',
        title: 'Add SKU Mapping',
        content: 'In the SKU Mappings section, click Add SKU and enter your store SKU.',
        position: 'left',
      },
    ],
  },
]

// Find matching tour based on user query
export const findTour = (query: string): GuidedTour | null => {
  const lowerQuery = query.toLowerCase()
  
  for (const tour of guidedTours) {
    for (const keyword of tour.keywords) {
      if (lowerQuery.includes(keyword)) {
        return tour
      }
    }
  }
  
  return null
}

// Get all available tour topics for suggestions
export const getTourTopics = (): string[] => {
  return guidedTours.map(t => t.name)
}
