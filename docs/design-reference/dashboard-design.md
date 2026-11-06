# Salla – All-in-One POS, Inventory, ERP & eCommerce approved dashboard design

The approved dashboard reference is `approved-dashboard-reference.png`.

## Layout requirements
- Keep the dark navy vertical sidebar on the left.
- Keep the Salla – All-in-One POS, Inventory, ERP & eCommerce logo at the top-left of the sidebar.
- Keep a full-width header across the main workspace (from the sidebar edge to the right edge).
- Header contains global search, company selector, country indicator, notifications, display controls, language, and user profile.
- Use the same dashboard layout for every tenant/company. Only company branding/configuration and tenant-scoped data may differ.
- Dashboard content includes six KPI cards, sales/purchases chart, sales-by-category chart, recent-sales table, stock-status table, company-performance summary, and quick actions.
- Addons navigation labels: ZATCA, WhatsApp, Marketplace. FBR Pakistan and VeriFactu Spain are not supported.

## Tenant isolation
The company selector shown in the UI is not an authorization boundary. The backend must derive the active company from the authenticated session and enforce tenant scope on every read/write endpoint. Users must not gain access by changing a company ID in a request.

## Data note
The dashboard currently uses illustrative display values. Connect these widgets to authenticated, company-scoped APIs before using them for operational reporting.
