'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {useLanguage} from '@/i18n/LanguageProvider';
import {
  Activity, BarChart3, Boxes, CreditCard, FileText, FolderKanban, Home, Landmark, ShieldCheck,
  Package, Puzzle, Settings, ShoppingBag, ShoppingCart, Store, Truck,
  UserRound, Users, Wallet, Wrench, ChevronDown, QrCode, CalendarDays, ChefHat,
  Bot, MessageCircle, Share2, Smartphone, Megaphone,
} from 'lucide-react';

const links = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Website', href: '/website', icon: Store },
  { label: 'CRM', href: '#crm', icon: Activity },
  { label: 'Ad Tech', href: '#ad-tech', icon: Megaphone },
  { label: 'Reports', href: '#reports', icon: FileText },
  { label: 'Addons', href: '/saas/addons', icon: Puzzle },
  { label: 'Settings', href: '#settings', icon: Settings },
  { label: 'Mobile App', href: '#mobile-app', icon: Smartphone },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {t} = useLanguage();
  const productPaths = ['/category', '/product-types', '/attributes', '/brand', '/unit', '/products', '/products/add', '/print-barcode', '/adjustment', '/adjustment/add', '/stock-count', '/damage'];
  const productActive = productPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const purchasePaths = ['/purchases', '/purchases/add', '/purchases/import-csv', '/purchases/landed-cost', '/purchases/returns'];
  const purchaseActive = purchasePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const peoplePaths = ['/customer', '/supplier', '/user', '/sale-agents', '/biller'];
  const peopleActive = peoplePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const salePaths = ['/sales', '/sales/installments', '/pos', '/sales/add', '/sales/import-csv', '/sales/packing-slip', '/sales/challan', '/sales/delivery', '/sales/gift-cards', '/sales/coupons', '/sales/courier', '/sales/returns', '/sales/exchange'];
  const saleActive = salePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const quotationPaths = ['/quotations', '/quotations/add'];
  const quotationActive = quotationPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const transferPaths = ['/transfers', '/transfers/add', '/transfers/import-csv'];
  const transferActive = transferPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const expensePaths = ['/expense-categories', '/expenses', '/expenses/add'];
  const expenseActive = expensePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const incomePaths = ['/income-categories', '/incomes', '/incomes/add'];
  const incomeActive = incomePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const accountingPaths = ['/accounting/health', '/accounting/trial-balance', '/accounting/general-ledger', '/accounting/balance-sheet', '/accounting/profit-and-loss', '/accounting/cash-flow-statement', '/accounting/periodic-inventory-close', '/accounting/chart-of-accounts', '/accounting/semantic-account-mappings', '/accounting/payment-accounts', '/accounting/payment-accounts/add', '/accounting/money-transfer'];
  const accountingActive = accountingPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const hrmPaths = ['/hrm/department', '/hrm/designation', '/hrm/shift', '/hrm/employee', '/hrm/attendance', '/hrm/holiday', '/hrm/overtime', '/hrm/leave-type', '/hrm/leaves', '/hrm/payroll'];
  const hrmActive = hrmPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const manufacturingPaths = ['/manufacturing/production', '/manufacturing/production/add', '/manufacturing/recipe'];
  const manufacturingActive = manufacturingPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const repairPaths = ['/repair', '/repair/dashboard', '/repair/service-jobs', '/repair/service-jobs/add', '/repair/device-types'];
  const repairActive = repairPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const projectManagementPaths = ['/projects', '/projects/add', '/project-categories', '/tasks'];
  const projectManagementActive = projectManagementPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const ecommercePaths = ['/ecommerce', '/ecommerce/sliders', '/ecommerce/menu', '/ecommerce/collections', '/ecommerce/pages', '/ecommerce/widgets', '/ecommerce/faq-category', '/ecommerce/faqs', '/ecommerce/social-links', '/ecommerce/blog', '/ecommerce/payment-gateways', '/ecommerce/settings', '/ecommerce/product-review', '/ecommerce/newsletter', '/ecommerce/delivery-areas', '/ecommerce/theme'];
  const ecommerceActive = ecommercePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const restaurantPaths = ['/restaurant/floors', '/restaurant/tables', '/restaurant/reservations', '/restaurant/menu-types', '/restaurant/modifier-groups', '/restaurant/kitchen', '/restaurant/kitchen-dashboard', '/restaurant/pos'];
  const restaurantActive = restaurantPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const gymPaths = ['/gym/dashboard', '/gym/members', '/gym/attendance', '/gym/packages', '/gym/classes', '/gym/settings'];
  const gymActive = gymPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const whatsappPaths = ['/whatsapp/settings', '/whatsapp/message-templates', '/whatsapp/send-message'];
  const whatsappActive = whatsappPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const socialCommercePaths = ['/social-commerce/dashboard', '/social-commerce/catalog', '/social-commerce/meta-feed', '/social-commerce/settings'];
  const socialCommerceActive = socialCommercePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const crmPaths = ['/crm/customer-management', '/crm/lead-management', '/crm/sales-management', '/crm/contact-management', '/crm/marketing-automation', '/crm/customer-support', '/crm/task-management', '/crm/reporting-analytics', '/crm/workflow-automation', '/crm/integration'];
  const crmActive = crmPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const adTechPaths = ['/ad-tech/campaigns', '/ad-tech/management', '/ad-tech/analytics', '/ad-tech/networks', '/ad-tech/audience-targeting', '/ad-tech/performance', '/ad-tech/revenue-reports', '/ad-tech/settings'];
  const adTechActive = adTechPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const reportsPaths = ['/settings/activity-log', '/reports/tax-report', '/reports/profit-loss', '/reports/profitability/product', '/reports/profitability/category', '/reports/profitability/brand', '/reports/profitability/customer', '/reports/profitability/location', '/reports/profitability/invoice', '/reports/best-seller', '/reports/product-report', '/reports/stock', '/reports/stock-ledger', '/reports/daily-sale', '/reports/monthly-sale', '/reports/daily-purchase', '/reports/monthly-purchase', '/reports/sale', '/reports/sale-agent', '/reports/challan', '/reports/sale-chart', '/reports/payment', '/reports/purchase', '/reports/customer', '/reports/customer-group', '/reports/customer-due', '/reports/supplier', '/reports/supplier-due', '/reports/warehouse', '/reports/warehouse-stock', '/reports/product-expiry', '/reports/product-quantity-alert', '/reports/daily-sale-objective', '/reports/user', '/reports/biller', '/reports/installment', '/cash-register'];
  const reportsActive = reportsPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const settingsPaths = ['/settings/role-permission', '/settings/general-setting', '/settings/modules', '/settings/languages', '/settings/warehouse', '/settings/tables', '/settings/discount-plan', '/settings/discount', '/settings/customer-group', '/settings/reward-points', '/settings/currency', '/settings/tax', '/settings/e-invoicing', '/settings/user-profile', '/settings/mail', '/settings/sms', '/settings/create-sms', '/settings/sms-templates', '/settings/pos', '/settings/payment-gateways', '/settings/receipt-printers', '/settings/invoice', '/settings/barcode', '/settings/hrm', '/settings/notifications', '/settings/send-notification', '/settings/notification-settings', '/settings/custom-fields', '/settings/backup'];
  const settingsActive = settingsPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const websitePaths = ['/website', '/website/pages', '/website/products', '/website/solutions', '/website/features', '/website/pricing', '/website/blog', '/website/media', '/website/seo', '/website/contacts', '/website/settings'];
  const websiteActive = websitePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const mobileAppPaths = ['/mobile-app/settings', '/mobile-app/theme-settings'];
  const mobileAppActive = mobileAppPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const saasAdminPaths = ['/saas-admin/dashboard', '/saas/companies', '/saas/plans', '/saas-admin/modules-addons', '/saas/subscriptions', '/saas-admin/trials', '/saas-admin/payments-transactions', '/saas-admin/commissions', '/saas-admin/coupons-promotions', '/saas-admin/revenue-reports'];
  const saasAdminActive = saasAdminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const aiAssistantActive = pathname === '/ai-assistant' || pathname.startsWith('/ai-assistant/');
  type OpenGroup = 'crm' | 'adTech' | 'people' | 'product' | 'purchase' | 'sale' | 'quotation' | 'transfer' | 'expense' | 'income' | 'accounting' | 'hrm' | 'manufacturing' | 'repair' | 'projectManagement' | 'ecommerce' | 'restaurant' | 'gym' | 'whatsapp' | 'socialCommerce' | 'reports' | 'settings' | 'mobileApp' | 'saasAdmin' | 'website' | null;
  const activeGroup: OpenGroup = crmActive ? 'crm' : adTechActive ? 'adTech' : peopleActive ? 'people' : productActive ? 'product' : purchaseActive ? 'purchase' : saleActive ? 'sale' : quotationActive ? 'quotation' : transferActive ? 'transfer' : expenseActive ? 'expense' : incomeActive ? 'income' : accountingActive ? 'accounting' : hrmActive ? 'hrm' : manufacturingActive ? 'manufacturing' : repairActive ? 'repair' : projectManagementActive ? 'projectManagement' : ecommerceActive ? 'ecommerce' : restaurantActive ? 'restaurant' : gymActive ? 'gym' : whatsappActive ? 'whatsapp' : socialCommerceActive ? 'socialCommerce' : reportsActive ? 'reports' : settingsActive ? 'settings' : mobileAppActive ? 'mobileApp' : saasAdminActive ? 'saasAdmin' : websiteActive ? 'website' : null;
  const [openGroup, setOpenGroup] = useState<OpenGroup>(activeGroup);

  // Opening a group closes the previously open group. Keep the active route's
  // parent expanded when navigating to one of its submenu pages.
  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [pathname, activeGroup]);

  const toggleGroup = (group: Exclude<OpenGroup, null>) => {
    setOpenGroup((current) => current === group ? null : group);
  };
  return (
    <aside className="erp-sidebar">
      <Link href="/dashboard" className="erp-brand"><span className="brand-mark">OW</span><span>OW <b>PLATFORM</b><small style={{display:'block',fontSize:10,opacity:.7,letterSpacing:1}}>APP</small></span></Link>
      <nav className="erp-nav" aria-label="Main navigation">
        {links.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '#' && pathname.startsWith(`${href}/`));
          return <div key={t(label)}>
            {label === 'CRM' ? <>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${crmActive ? 'selected' : ''}`} onClick={() => toggleGroup('crm')} aria-expanded={openGroup === 'crm'} aria-controls="crm-subnav">
                <Icon size={19}/><span>{t(label)}</span><ChevronDown size={14} className={openGroup === 'crm' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'crm' && <div id="crm-subnav" className="erp-subnav erp-crm-subnav">
                {[
                  { label: 'Customer Management', href: '/crm/customer-management' },
                  { label: 'Lead Management', href: '/crm/lead-management' },
                  { label: 'Sales Management', href: '/crm/sales-management' },
                  { label: 'Contact Management', href: '/crm/contact-management' },
                  { label: 'Marketing Automation', href: '/crm/marketing-automation' },
                  { label: 'Customer Support', href: '/crm/customer-support' },
                  { label: 'Task Management', href: '/crm/task-management' },
                  { label: 'Reporting and Analytics', href: '/crm/reporting-analytics' },
                  { label: 'Workflow Automation', href: '/crm/workflow-automation' },
                  { label: 'Integration', href: '/crm/integration' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
            </> : label === 'Ad Tech' ? <>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${adTechActive ? 'selected' : ''}`} onClick={() => toggleGroup('adTech')} aria-expanded={openGroup === 'adTech'} aria-controls="ad-tech-subnav">
                <Icon size={19}/><span>{t(label)}</span><ChevronDown size={14} className={openGroup === 'adTech' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'adTech' && <div id="ad-tech-subnav" className="erp-subnav erp-ad-tech-subnav">
                {[
                  { label: 'Ad Campaigns', href: '/ad-tech/campaigns' },
                  { label: 'Ad Management', href: '/ad-tech/management' },
                  { label: 'Ad Analytics', href: '/ad-tech/analytics' },
                  { label: 'Ad Networks', href: '/ad-tech/networks' },
                  { label: 'Audience Targeting', href: '/ad-tech/audience-targeting' },
                  { label: 'Ad Performance', href: '/ad-tech/performance' },
                  { label: 'Revenue Reports', href: '/ad-tech/revenue-reports' },
                  { label: 'Settings', href: '/ad-tech/settings' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
            </> : label === 'Reports' ? <>

              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${reportsActive ? 'selected' : ''}`} onClick={() => toggleGroup('reports')} aria-expanded={openGroup === 'reports'} aria-controls="reports-subnav">
                <Icon size={19}/><span>{t(label)}</span><ChevronDown size={14} className={openGroup === 'reports' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'reports' && <div id="reports-subnav" className="erp-subnav erp-reports-subnav">
                {[
                  { label: 'Activity Log', href: '/settings/activity-log' },
                  { label: 'Tax Report', href: '/reports/tax-report' },
                  { label: 'Profit/Loss Report', href: '/reports/profit-loss' },
                  { label: 'Profit by Product', href: '/reports/profitability/product' },
                  { label: 'Profit by Category', href: '/reports/profitability/category' },
                  { label: 'Profit by Brand', href: '/reports/profitability/brand' },
                  { label: 'Profit by Customer', href: '/reports/profitability/customer' },
                  { label: 'Profit by Location', href: '/reports/profitability/location' },
                  { label: 'Profit by Invoice', href: '/reports/profitability/invoice' },
                  { label: 'Best Seller', href: '/reports/best-seller' },
                  { label: 'Product Report', href: '/reports/product-report' },
                  { label: 'Stock Report', href: '/reports/stock' },
                  { label: 'Stock Ledger', href: '/reports/stock-ledger' },
                  { label: 'Daily Sale', href: '/reports/daily-sale' },
                  { label: 'Monthly Sale', href: '/reports/monthly-sale' },
                  { label: 'Daily Purchase', href: '/reports/daily-purchase' },
                  { label: 'Monthly Purchase', href: '/reports/monthly-purchase' },
                  { label: 'Sale Report', href: '/reports/sale' },
                  { label: 'Sale Agent Report', href: '/reports/sale-agent' },
                  { label: 'Challan Report', href: '/reports/challan' },
                  { label: 'Sale Report Chart', href: '/reports/sale-chart' },
                  { label: 'Payment Report', href: '/reports/payment' },
                  { label: 'Purchase Report', href: '/reports/purchase' },
                  { label: 'Customer Report', href: '/reports/customer' },
                  { label: 'Customer Group Report', href: '/reports/customer-group' },
                  { label: 'Customer Due Report', href: '/reports/customer-due' },
                  { label: 'Supplier Report', href: '/reports/supplier' },
                  { label: 'Supplier Due Report', href: '/reports/supplier-due' },
                  { label: 'Warehouse Report', href: '/reports/warehouse' },
                  { label: 'Warehouse Stock Chart', href: '/reports/warehouse-stock' },
                  { label: 'Product Expiry Report', href: '/reports/product-expiry' },
                  { label: 'Product Quantity Alert', href: '/reports/product-quantity-alert' },
                  { label: 'Daily Sale Objective Report', href: '/reports/daily-sale-objective' },
                  { label: 'User Report', href: '/reports/user' },
                  { label: 'Biller Report', href: '/reports/biller' },
                  { label: 'Instalment Report', href: '/reports/installment' },
                  { label: 'Cash Register', href: '/cash-register' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
            </> : label === 'Settings' ? <>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${settingsActive ? 'selected' : ''}`} onClick={() => toggleGroup('settings')} aria-expanded={openGroup === 'settings'} aria-controls="settings-subnav">
                <Icon size={19}/><span>{t(label)}</span><ChevronDown size={14} className={openGroup === 'settings' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'settings' && <div id="settings-subnav" className="erp-subnav erp-settings-subnav">
                {[
                  { label: 'Role Permission', href: '/settings/role-permission' },
                  { label: 'General Setting', href: '/settings/general-setting' },
                  { label: 'Modules / Features', href: '/settings/modules' },
                  { label: 'Languages & Translations', href: '/settings/languages' },
                  { label: 'Warehouse', href: '/settings/warehouse' },
                  { label: 'Tables', href: '/settings/tables' },
                  { label: 'Discount Plan', href: '/settings/discount-plan' },
                  { label: 'Discount', href: '/settings/discount' },
                  { label: 'Customer Group', href: '/settings/customer-group' },
                  { label: 'Reward Point Setting', href: '/settings/reward-points' },
                  { label: 'Currency', href: '/settings/currency' },
                  { label: 'Tax', href: '/settings/tax' },
                  { label: 'E-Invoicing', href: '/settings/e-invoicing' },
                  { label: 'User Profile', href: '/settings/user-profile' },
                  { label: 'Mail Setting', href: '/settings/mail' },
                  { label: 'SMS Setting', href: '/settings/sms' },
                  { label: 'Create SMS', href: '/settings/create-sms' },
                  { label: 'SMS Template', href: '/settings/sms-templates' },
                  { label: 'POS Settings', href: '/settings/pos' },
                  { label: 'Payment Gateways', href: '/settings/payment-gateways' },
                  { label: 'Receipt Printers', href: '/settings/receipt-printers' },
                  { label: 'Invoice Settings', href: '/settings/invoice' },
                  { label: 'Barcode Settings', href: '/settings/barcode' },
                  { label: 'HRM Setting', href: '/settings/hrm' },
                  { label: 'All Notification', href: '/settings/notifications' },
                  { label: 'Send Notification', href: '/settings/send-notification' },
                  { label: 'Notification Settings', href: '/settings/notification-settings' },
                  { label: 'Custom Field List', href: '/settings/custom-fields' },
                  { label: 'Backup Database', href: '/settings/backup' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
            </> : label === 'Website' ? <>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${websiteActive ? 'selected' : ''}`} onClick={() => toggleGroup('website')} aria-expanded={openGroup === 'website'} aria-controls="website-subnav">
                <Icon size={19}/><span>{t(label)}</span><ChevronDown size={14} className={openGroup === 'website' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'website' && <div id="website-subnav" className="erp-subnav erp-website-subnav">
                {[
                  { label: 'Website Dashboard', href: '/website' },
                  { label: 'Pages', href: '/website/pages' },
                  { label: 'Products', href: '/website/products' },
                  { label: 'Solutions', href: '/website/solutions' },
                  { label: 'Features', href: '/website/features' },
                  { label: 'Pricing', href: '/website/pricing' },
                  { label: 'Blog', href: '/website/blog' },
                  { label: 'Media Library', href: '/website/media' },
                  { label: 'SEO Settings', href: '/website/seo' },
                  { label: 'Contact Requests', href: '/website/contacts' },
                  { label: 'Website Settings', href: '/website/settings' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
            </> : label === 'Mobile App' ? <>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${mobileAppActive ? 'selected' : ''}`} onClick={() => toggleGroup('mobileApp')} aria-expanded={openGroup === 'mobileApp'} aria-controls="mobile-app-subnav">
                <Icon size={19}/><span>{t(label)}</span><ChevronDown size={14} className={openGroup === 'mobileApp' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'mobileApp' && <div id="mobile-app-subnav" className="erp-subnav erp-mobile-app-subnav">
                {[
                  { label: 'App Setting', href: '/mobile-app/settings' },
                  { label: 'App Theme Settings', href: '/mobile-app/theme-settings' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
            </> : <Link href={href} aria-current={active ? 'page' : undefined} className={`erp-nav-link ${active ? 'selected' : ''}`}><Icon size={19}/><span>{t(label)}</span></Link>}
            {label === 'Dashboard' && <>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${peopleActive ? 'selected' : ''}`} onClick={() => toggleGroup('people')} aria-expanded={openGroup === 'people'} aria-controls="people-subnav">
                <Users size={19}/><span>People</span><ChevronDown size={14} className={openGroup === 'people' ? 'rotate-180' : ''}/>
              </button>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${saasAdminActive ? 'selected' : ''}`} onClick={() => toggleGroup('saasAdmin')} aria-expanded={openGroup === 'saasAdmin'} aria-controls="saas-admin-subnav">
                <ShieldCheck size={19}/><span>SaaS Platform</span><ChevronDown size={14} className={openGroup === 'saasAdmin' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'saasAdmin' && <div id="saas-admin-subnav" className="erp-subnav erp-saas-admin-subnav">
                {[
                  { label: 'Dashboard', href: '/saas-admin/dashboard' },
                  { label: 'Companies', href: '/saas/companies' },
                  { label: 'Plans', href: '/saas/plans' },
                  { label: 'Addons', href: '/saas-admin/modules-addons' },
                  { label: 'Subscriptions', href: '/saas/subscriptions' },
                  { label: 'Trials', href: '/saas-admin/trials' },
                  { label: 'Payments', href: '/saas-admin/payments-transactions' },
                  { label: 'Commissions', href: '/saas-admin/commissions' },
                  { label: 'Coupons', href: '/saas-admin/coupons-promotions' },
                  { label: 'Revenue', href: '/saas-admin/revenue-reports' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              {openGroup === 'people' && <div id="people-subnav" className="erp-subnav erp-people-subnav">
                {[
                  { label: 'Customers', href: '/customer' },
                  { label: 'Supplier', href: '/supplier' },
                  { label: 'Users', href: '/user' },
                  { label: 'Sale Agents', href: '/sale-agents' },
                  { label: 'Billers', href: '/biller' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${productActive ? 'selected' : ''}`} onClick={() => toggleGroup('product')} aria-expanded={openGroup === 'product'} aria-controls="product-subnav">
                <Package size={19}/><span>Product</span><ChevronDown size={14} className={openGroup === 'product' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'product' && <div id="product-subnav" className="erp-subnav erp-product-subnav">
                {[
                  { label: 'Category', href: '/category' },
                  { label: 'Product Types', href: '/product-types' },
                  { label: 'Attributes', href: '/attributes' },
                  { label: 'Brand', href: '/brand' },
                  { label: 'Unit', href: '/unit' },
                  { label: 'Products', href: '/products' },
                  { label: 'Add Product', href: '/products/add' },
                  { label: 'Print Barcode', href: '/print-barcode' },
                  { label: 'Adjustment', href: '/adjustment' },
                  { label: 'Add Adjustment', href: '/adjustment/add' },
                  { label: 'Stock Count', href: '/stock-count' },
                  { label: 'Damage', href: '/damage' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${purchaseActive ? 'selected' : ''}`} onClick={() => toggleGroup('purchase')} aria-expanded={openGroup === 'purchase'} aria-controls="purchase-subnav">
                <ShoppingCart size={19}/><span>Purchase</span><ChevronDown size={14} className={openGroup === 'purchase' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'purchase' && <div id="purchase-subnav" className="erp-subnav erp-purchase-subnav">
                {[
                  { label: 'Purchase List', href: '/purchases' },
                  { label: 'Add Purchase', href: '/purchases/add' },
                  { label: 'Import Purchase By CSV', href: '/purchases/import-csv' },
                  { label: 'Import / Landed Cost', href: '/purchases/landed-cost' },
                  { label: 'Purchase Return', href: '/purchases/returns' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${saleActive ? 'selected' : ''}`} onClick={() => toggleGroup('sale')} aria-expanded={openGroup === 'sale'} aria-controls="sale-subnav">
                <ShoppingBag size={19}/><span>Sale</span><ChevronDown size={14} className={openGroup === 'sale' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'sale' && <div id="sale-subnav" className="erp-subnav erp-sale-subnav">
                {[
                  { label: 'Sale', href: '/sales' },
                  { label: 'Instalment', href: '/sales/installments' },
                  { label: 'POS', href: '/pos' },
                  { label: 'Add Sale', href: '/sales/add' },
                  { label: 'Import Sale By CSV', href: '/sales/import-csv' },
                  { label: 'Packing Slip', href: '/sales/packing-slip' },
                  { label: 'Challan', href: '/sales/challan' },
                  { label: 'Delivery', href: '/sales/delivery' },
                  { label: 'Gift Card', href: '/sales/gift-cards' },
                  { label: 'Coupon', href: '/sales/coupons' },
                  { label: 'Courier', href: '/sales/courier' },
                  { label: 'Sale Return', href: '/sales/returns' },
                  { label: 'Sale Exchange', href: '/sales/exchange' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${quotationActive ? 'selected' : ''}`} onClick={() => toggleGroup('quotation')} aria-expanded={openGroup === 'quotation'} aria-controls="quotation-subnav">
                <FileText size={19}/><span>Quotation</span><ChevronDown size={14} className={openGroup === 'quotation' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'quotation' && <div id="quotation-subnav" className="erp-subnav erp-quotation-subnav">
                {[
                  { label: 'Quotation List', href: '/quotations' },
                  { label: 'Add Quotation', href: '/quotations/add' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${transferActive ? 'selected' : ''}`} onClick={() => toggleGroup('transfer')} aria-expanded={openGroup === 'transfer'} aria-controls="transfer-subnav">
                <Truck size={19}/><span>Transfer</span><ChevronDown size={14} className={openGroup === 'transfer' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'transfer' && <div id="transfer-subnav" className="erp-subnav erp-transfer-subnav">
                {[
                  { label: 'Transfer List', href: '/transfers' },
                  { label: 'Add Transfer', href: '/transfers/add' },
                  { label: 'Import Transfer By CSV', href: '/transfers/import-csv' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${expenseActive ? 'selected' : ''}`} onClick={() => toggleGroup('expense')} aria-expanded={openGroup === 'expense'} aria-controls="expense-subnav">
                <Wallet size={19}/><span>Expense</span><ChevronDown size={14} className={openGroup === 'expense' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'expense' && <div id="expense-subnav" className="erp-subnav erp-expense-subnav">
                {[
                  { label: 'Expense Category', href: '/expense-categories' },
                  { label: 'Expense List', href: '/expenses' },
                  { label: 'Add Expense', href: '/expenses/add' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${incomeActive ? 'selected' : ''}`} onClick={() => toggleGroup('income')} aria-expanded={openGroup === 'income'} aria-controls="income-subnav">
                <CreditCard size={19}/><span>Income</span><ChevronDown size={14} className={openGroup === 'income' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'income' && <div id="income-subnav" className="erp-subnav erp-income-subnav">
                {[
                  { label: 'Income Category', href: '/income-categories' },
                  { label: 'Income List', href: '/incomes' },
                  { label: 'Add Income', href: '/incomes/add' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${accountingActive ? 'selected' : ''}`} onClick={() => toggleGroup('accounting')} aria-expanded={openGroup === 'accounting'} aria-controls="accounting-subnav">
                <Landmark size={19}/><span>Accounting</span><ChevronDown size={14} className={openGroup === 'accounting' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'accounting' && <div id="accounting-subnav" className="erp-subnav erp-accounting-subnav">
                {[
                  { label: 'Accounting Health', href: '/accounting/health' },
                  { label: 'Trial Balance', href: '/accounting/trial-balance' },
                  { label: 'General Ledger', href: '/accounting/general-ledger' },
                  { label: 'Balance Sheet', href: '/accounting/balance-sheet' },
                  { label: 'Profit And Loss', href: '/accounting/profit-and-loss' },
                  { label: 'Cash Flow Statement', href: '/accounting/cash-flow-statement' },
                  { label: 'Periodic Inventory Close', href: '/accounting/periodic-inventory-close' },
                  { label: 'Chart Of Accounts', href: '/accounting/chart-of-accounts' },
                  { label: 'Semantic Account Mappings', href: '/accounting/semantic-account-mappings' },
                  { label: 'Payment Accounts', href: '/accounting/payment-accounts' },
                  { label: 'Add Payment Account', href: '/accounting/payment-accounts/add' },
                  { label: 'Money Transfer', href: '/accounting/money-transfer' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${hrmActive ? 'selected' : ''}`} onClick={() => toggleGroup('hrm')} aria-expanded={openGroup === 'hrm'} aria-controls="hrm-subnav">
                <UserRound size={19}/><span>HRM</span><ChevronDown size={14} className={openGroup === 'hrm' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'hrm' && <div id="hrm-subnav" className="erp-subnav erp-hrm-subnav">
                {[
                  { label: 'Department', href: '/hrm/department' },
                  { label: 'Designation', href: '/hrm/designation' },
                  { label: 'Shift', href: '/hrm/shift' },
                  { label: 'Employee', href: '/hrm/employee' },
                  { label: 'Attendance', href: '/hrm/attendance' },
                  { label: 'Holiday', href: '/hrm/holiday' },
                  { label: 'Overtime', href: '/hrm/overtime' },
                  { label: 'Leave Type', href: '/hrm/leave-type' },
                  { label: 'Leaves', href: '/hrm/leaves' },
                  { label: 'Payroll', href: '/hrm/payroll' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <Link href="/catalogue-qr" className={`erp-nav-link ${pathname === '/catalogue-qr' || pathname.startsWith('/catalogue-qr/') ? 'selected' : ''}`}>
                <QrCode size={19}/><span>Catalogue QR</span>
              </Link>
              <Link href="/booking" className={`erp-nav-link ${pathname === '/booking' || pathname.startsWith('/booking/') ? 'selected' : ''}`}>
                <CalendarDays size={19}/><span>Booking</span>
              </Link>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${manufacturingActive ? 'selected' : ''}`} onClick={() => toggleGroup('manufacturing')} aria-expanded={openGroup === 'manufacturing'} aria-controls="manufacturing-subnav">
                <Wrench size={19}/><span>Manufacturing</span><ChevronDown size={14} className={openGroup === 'manufacturing' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'manufacturing' && <div id="manufacturing-subnav" className="erp-subnav erp-manufacturing-subnav">
                {[
                  { label: 'Production List', href: '/manufacturing/production' },
                  { label: 'Add Production', href: '/manufacturing/production/add' },
                  { label: 'Recipe', href: '/manufacturing/recipe' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${repairActive ? 'selected' : ''}`} onClick={() => toggleGroup('repair')} aria-expanded={openGroup === 'repair'} aria-controls="repair-subnav">
                <Wrench size={19}/><span>Repair Management</span><ChevronDown size={14} className={openGroup === 'repair' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'repair' && <div id="repair-subnav" className="erp-subnav erp-repair-subnav">
                {[
                  { label: 'Repair Dashboard', href: '/repair/dashboard' },
                  { label: 'Service Jobs', href: '/repair/service-jobs' },
                  { label: 'Add Service Job', href: '/repair/service-jobs/add' },
                  { label: 'Device Types', href: '/repair/device-types' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${projectManagementActive ? 'selected' : ''}`} onClick={() => toggleGroup('projectManagement')} aria-expanded={openGroup === 'projectManagement'} aria-controls="project-management-subnav">
                <FolderKanban size={19}/><span>Project Management</span><ChevronDown size={14} className={openGroup === 'projectManagement' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'projectManagement' && <div id="project-management-subnav" className="erp-subnav erp-project-management-subnav">
                {[
                  { label: 'Project', href: '/projects' },
                  { label: 'Project Category', href: '/project-categories' },
                  { label: 'Task', href: '/tasks' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${ecommerceActive ? 'selected' : ''}`} onClick={() => toggleGroup('ecommerce')} aria-expanded={openGroup === 'ecommerce'} aria-controls="ecommerce-subnav">
                <Store size={19}/><span>E-commerce</span><ChevronDown size={14} className={openGroup === 'ecommerce' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'ecommerce' && <div id="ecommerce-subnav" className="erp-subnav erp-ecommerce-subnav">
                {[
                  { label: 'Sliders', href: '/ecommerce/sliders' },
                  { label: 'Menu', href: '/ecommerce/menu' },
                  { label: 'Collections', href: '/ecommerce/collections' },
                  { label: 'Pages', href: '/ecommerce/pages' },
                  { label: 'Widgets', href: '/ecommerce/widgets' },
                  { label: 'Faq Category', href: '/ecommerce/faq-category' },
                  { label: 'Faqs', href: '/ecommerce/faqs' },
                  { label: 'Social Links', href: '/ecommerce/social-links' },
                  { label: 'Blog', href: '/ecommerce/blog' },
                  { label: 'Payment Gateways', href: '/ecommerce/payment-gateways' },
                  { label: 'Settings', href: '/ecommerce/settings' },
                  { label: 'Product Review', href: '/ecommerce/product-review' },
                  { label: 'Newsletter', href: '/ecommerce/newsletter' },
                  { label: 'Delivery Areas', href: '/ecommerce/delivery-areas' },
                  { label: 'Theme', href: '/ecommerce/theme' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${restaurantActive ? 'selected' : ''}`} onClick={() => toggleGroup('restaurant')} aria-expanded={openGroup === 'restaurant'} aria-controls="restaurant-subnav">
                <ChefHat size={19}/><span>Restaurant</span><ChevronDown size={14} className={openGroup === 'restaurant' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'restaurant' && <div id="restaurant-subnav" className="erp-subnav erp-restaurant-subnav">
                {[
                  { label: 'Floors', href: '/restaurant/floors' },
                  { label: 'Tables', href: '/restaurant/tables' },
                  { label: 'Reservation', href: '/restaurant/reservations' },
                  { label: 'Menu Type', href: '/restaurant/menu-types' },
                  { label: 'Modifier Group', href: '/restaurant/modifier-groups' },
                  { label: 'Kitchen', href: '/restaurant/kitchen' },
                  { label: 'Kitchen Dashboard', href: '/restaurant/kitchen-dashboard' },
                  { label: 'Restaurant POS', href: '/restaurant/pos' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${gymActive ? 'selected' : ''}`} onClick={() => toggleGroup('gym')} aria-expanded={openGroup === 'gym'} aria-controls="gym-subnav">
                <Activity size={19}/><span>Gym</span><ChevronDown size={14} className={openGroup === 'gym' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'gym' && <div id="gym-subnav" className="erp-subnav erp-gym-subnav">
                {[
                  { label: 'Dashboard', href: '/gym/dashboard' },
                  { label: 'Members', href: '/gym/members' },
                  { label: 'Attendance', href: '/gym/attendance' },
                  { label: 'Packages', href: '/gym/packages' },
                  { label: 'Classes', href: '/gym/classes' },
                  { label: 'Settings', href: '/gym/settings' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <Link href="/ai-assistant" className={`erp-nav-link ${aiAssistantActive ? 'selected' : ''}`}>
                <Bot size={19}/><span>AI Assistant</span>
              </Link>
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${whatsappActive ? 'selected' : ''}`} onClick={() => toggleGroup('whatsapp')} aria-expanded={openGroup === 'whatsapp'} aria-controls="whatsapp-subnav">
                <MessageCircle size={19}/><span>WhatsApp</span><ChevronDown size={14} className={openGroup === 'whatsapp' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'whatsapp' && <div id="whatsapp-subnav" className="erp-subnav erp-whatsapp-subnav">
                {[
                  { label: 'WhatsApp Settings', href: '/whatsapp/settings' },
                  { label: 'Message Templates', href: '/whatsapp/message-templates' },
                  { label: 'Send Message', href: '/whatsapp/send-message' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
              <button type="button" className={`erp-nav-link erp-nav-group-toggle ${socialCommerceActive ? 'selected' : ''}`} onClick={() => toggleGroup('socialCommerce')} aria-expanded={openGroup === 'socialCommerce'} aria-controls="social-commerce-subnav">
                <Share2 size={19}/><span>Social Commerce</span><ChevronDown size={14} className={openGroup === 'socialCommerce' ? 'rotate-180' : ''}/>
              </button>
              {openGroup === 'socialCommerce' && <div id="social-commerce-subnav" className="erp-subnav erp-social-commerce-subnav">
                {[
                  { label: 'Dashboard', href: '/social-commerce/dashboard' },
                  { label: 'Catalog', href: '/social-commerce/catalog' },
                  { label: 'Meta Feed', href: '/social-commerce/meta-feed' },
                  { label: 'Settings', href: '/social-commerce/settings' },
                ].map((item) => <Link key={item.href} href={item.href} className={`erp-subnav-link ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'selected' : ''}`}>{t(item.label)}</Link>)}
              </div>}
            </>}
          </div>;
        })}
      </nav>
      <div className="sidebar-footer">OW PLATFORM <span>APP · v1.0.0</span></div>
    </aside>
  );
}
