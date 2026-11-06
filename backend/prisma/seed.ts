import { PrismaClient } from '@prisma/client';
import * as bcrypt from '../src/common/bcrypt';

const db = new PrismaClient();

const permissionKeys = [
  'dashboard.read', 'companies.read', 'branches.manage', 'users.manage',
  'products.read', 'products.create', 'products.update', 'products.delete',
  'categories.manage', 'inventory.read', 'inventory.adjust', 'warehouses.manage',
  'sales.read', 'sales.create', 'sales.update', 'sales.void',
  'purchases.read', 'purchases.create', 'customers.manage', 'suppliers.manage',
  'pos.use', 'accounting.read', 'accounting.manage', 'reports.read',
  'settings.manage', 'subscriptions.manage', 'project.view_assigned', 'project.view_all', 'project.manage',
];

async function main() {
  // Global authorization data (shared across tenants).
  for (const key of permissionKeys) {
    await db.permission.upsert({ where: { key }, update: {}, create: { key, description: key.replace('.', ' ') } });
  }
  const roleSpecs = [
    { key: 'platform_owner', name: 'Platform Owner', keys: permissionKeys },
    { key: 'company_owner', name: 'Company Owner', keys: permissionKeys.filter(k => k !== 'subscriptions.manage') },
    { key: 'company_admin', name: 'Company Administrator', keys: permissionKeys.filter(k => k !== 'subscriptions.manage') },
    { key: 'company_staff', name: 'Company Staff', keys: ['dashboard.read','products.read','inventory.read','sales.read','sales.create','purchases.read','pos.use','reports.read','project.view_assigned'] },
  ];
  const roles = new Map<string, {id:string}>();
  for (const spec of roleSpecs) {
    const role = await db.role.upsert({ where: { key: spec.key }, update: { name: spec.name }, create: { key: spec.key, name: spec.name } });
    roles.set(spec.key, role);
    for (const key of spec.keys) {
      const permission = await db.permission.findUniqueOrThrow({ where: { key } });
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {}, create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  // DEMO ONLY: all demo users use `password`. Change before production.
  const passwordHash = await bcrypt.hash('password', 12);
  const accountSpecs = [
    { email: 'owner@myexample.com', firstName: 'SalePro', lastName: 'Owner' },
    { email: 'company@example.com', firstName: 'Company', lastName: 'One Admin' },
    { email: 'company@example1.com', firstName: 'Company', lastName: 'Two Admin' },
    { email: 'companyuser@example.com', firstName: 'Company One', lastName: 'User' },
    { email: 'companyuser@example1.com', firstName: 'Company Two', lastName: 'User' },
  ];
  const users = new Map<string, {id:string}>();
  for (const spec of accountSpecs) {
    const user = await db.user.upsert({ where: { email: spec.email }, update: { passwordHash, firstName: spec.firstName, lastName: spec.lastName, status: 'ACTIVE' }, create: { ...spec, passwordHash } });
    users.set(spec.email, user);
  }

  const companySpecs = [
    { name: 'Company One', slug: 'company-one', countryCode: 'PK', currencyCode: 'PKR' },
    { name: 'Company Two', slug: 'company-two', countryCode: 'PK', currencyCode: 'PKR' },
  ];
  const companies = [];
  for (const spec of companySpecs) {
    companies.push(await db.company.upsert({ where: { slug: spec.slug }, update: spec, create: spec }));
  }

  const ownerRole = roles.get('company_owner')!;
  const adminRole = roles.get('company_admin')!;
  const staffRole = roles.get('company_staff')!;
  const [companyOne, companyTwo] = companies;
  const memberships = [
    { companyId: companyOne.id, user: users.get('owner@myexample.com')!, roleId: ownerRole.id, isDefault: true },
    { companyId: companyTwo.id, user: users.get('owner@myexample.com')!, roleId: ownerRole.id, isDefault: false },
    { companyId: companyOne.id, user: users.get('company@example.com')!, roleId: adminRole.id, isDefault: true },
    { companyId: companyTwo.id, user: users.get('company@example1.com')!, roleId: adminRole.id, isDefault: true },
    { companyId: companyOne.id, user: users.get('companyuser@example.com')!, roleId: staffRole.id, isDefault: true },
    { companyId: companyTwo.id, user: users.get('companyuser@example1.com')!, roleId: staffRole.id, isDefault: true },
  ];
  for (const m of memberships) await db.companyUser.upsert({
    where: { companyId_userId: { companyId: m.companyId, userId: m.user.id } },
    update: { roleId: m.roleId, isDefault: m.isDefault, status: 'ACTIVE' },
    create: { companyId: m.companyId, userId: m.user.id, roleId: m.roleId, isDefault: m.isDefault },
  });

  const plan = await db.subscriptionPlan.upsert({
    where: { code: 'DEMO-PRO' }, update: {},
    create: { name: 'Demo Pro', code: 'DEMO-PRO', price: '0', interval: 'month', limits: { users: 25, branches: 10, products: 5000, warehouses: 10 } },
  });

  // Every tenant receives 10 records in each applicable master/transaction table.
  for (let ci = 0; ci < companies.length; ci++) {
    const company = companies[ci];
    const prefix = ci === 0 ? 'C1' : 'C2';
    // Reuse the earlier starter seed's MAIN branch as record 1 to avoid an extra branch.
    await db.branch.updateMany({ where: { companyId: company.id, code: 'MAIN' }, data: { code: `${prefix}-BR-01`, name: `${company.name} Branch 1`, isDefault: true } });
    const branchIds: string[] = [];
    const warehouseIds: string[] = [];
    const categoryIds: string[] = [];
    const productIds: string[] = [];
    const customerIds: string[] = [];
    const supplierIds: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const branch = await db.branch.upsert({
        where: { companyId_code: { companyId: company.id, code: `${prefix}-BR-${String(i).padStart(2,'0')}` } },
        update: {}, create: { companyId: company.id, name: `${company.name} Branch ${i}`, code: `${prefix}-BR-${String(i).padStart(2,'0')}`, address: `Demo address ${i}, Lahore, Pakistan`, isDefault: i === 1 },
      });
      branchIds.push(branch.id);
      const warehouse = await db.warehouse.upsert({
        where: { companyId_code: { companyId: company.id, code: `${prefix}-WH-${String(i).padStart(2,'0')}` } },
        update: { branchId: branch.id }, create: { companyId: company.id, branchId: branch.id, name: `${company.name} Warehouse ${i}`, code: `${prefix}-WH-${String(i).padStart(2,'0')}` },
      });
      warehouseIds.push(warehouse.id);
      const category = await db.category.upsert({
        where: { companyId_name: { companyId: company.id, name: `${company.name} Category ${i}` } },
        update: {}, create: { companyId: company.id, name: `${company.name} Category ${i}` },
      });
      categoryIds.push(category.id);
      const product = await db.product.upsert({
        where: { companyId_sku: { companyId: company.id, sku: `${prefix}-SKU-${String(i).padStart(4,'0')}` } },
        update: { name: `${company.name} Demo Product ${i}`, categoryId: category.id },
        create: { companyId: company.id, categoryId: category.id, sku: `${prefix}-SKU-${String(i).padStart(4,'0')}`, barcode: `${8900000000000 + ci * 1000 + i}`, name: `${company.name} Demo Product ${i}`, description: `Seeded demo inventory item ${i}`, costPrice: `${100 + i * 10}`, salePrice: `${150 + i * 15}`, taxRate: '0', unit: 'pcs' },
      });
      productIds.push(product.id);
      const customer = await db.customer.upsert({
        where: { id: `00000000-0000-4000-800${ci}-${String(i).padStart(3,'0')}000000000`  },
        update: { name: `${company.name} Customer ${i}` },
        create: { id: `00000000-0000-4000-800${ci}-${String(i).padStart(3,'0')}000000000` , companyId: company.id, name: `${company.name} Customer ${i}`, email: `customer${i}@${prefix.toLowerCase()}.demo`, phone: `0300${String(ci+1)}${String(i).padStart(6,'0')}`, creditLimit: '50000' },
      });
      customerIds.push(customer.id);
      const supplier = await db.supplier.upsert({
        where: { id: `00000000-0000-4000-900${ci}-${String(i).padStart(3,'0')}000000000`  },
        update: { name: `${company.name} Supplier ${i}` },
        create: { id: `00000000-0000-4000-900${ci}-${String(i).padStart(3,'0')}000000000` , companyId: company.id, name: `${company.name} Supplier ${i}`, email: `supplier${i}@${prefix.toLowerCase()}.demo`, phone: `0310${String(ci+1)}${String(i).padStart(6,'0')}` },
      });
      supplierIds.push(supplier.id);
    }

    await db.subscription.upsert({
      where: { id: `00000000-0000-4000-a00${ci}-000000000001` }, update: { planId: plan.id, status: 'TRIALING' },
      create: { id: `00000000-0000-4000-a00${ci}-000000000001`, companyId: company.id, planId: plan.id, status: 'TRIALING' },
    });

    // Clear generated movements and replace them, so repeated seeding stays at exactly 10.
    await db.stockMovement.deleteMany({ where: { companyId: company.id } });
    for (let i = 0; i < 10; i++) await db.stockMovement.create({ data: {
      companyId: company.id, productId: productIds[i], warehouseId: warehouseIds[i], type: 'OPENING', quantity: `${100 + i * 10}`, unitCost: `${100 + i * 10}`, referenceType: 'SEED',
    }});

    for (let i = 1; i <= 10; i++) {
      const subtotal = (150 + i * 15) * i;
      const sale = await db.sale.upsert({
        where: { companyId_invoiceNumber: { companyId: company.id, invoiceNumber: `${prefix}-INV-${String(i).padStart(4,'0')}` } },
        update: { branchId: branchIds[(i-1)%10], customerId: customerIds[(i-1)%10], subtotal: `${subtotal}`, taxTotal: '0', discountTotal: '0', grandTotal: `${subtotal}`, currencyCode: company.currencyCode, status: 'POSTED', paymentStatus: 'PAID' },
        create: { companyId: company.id, branchId: branchIds[(i-1)%10], customerId: customerIds[(i-1)%10], invoiceNumber: `${prefix}-INV-${String(i).padStart(4,'0')}`, subtotal: `${subtotal}`, taxTotal: '0', discountTotal: '0', grandTotal: `${subtotal}`, currencyCode: company.currencyCode, status: 'POSTED', paymentStatus: 'PAID' },
      });
      await db.saleItem.deleteMany({ where: { saleId: sale.id } });
      await db.saleItem.create({ data: { saleId: sale.id, productId: productIds[(i-1)%10], description: `Demo product ${i}`, quantity: `${i}`, unitPrice: `${150 + i * 15}`, taxRate: '0', lineTotal: `${subtotal}` } });

      const purchaseTotal = (100 + i * 10) * i;
      const purchase = await db.purchase.upsert({
        where: { companyId_referenceNumber: { companyId: company.id, referenceNumber: `${prefix}-PO-${String(i).padStart(4,'0')}` } },
        update: { supplierId: supplierIds[(i-1)%10], subtotal: `${purchaseTotal}`, taxTotal: '0', grandTotal: `${purchaseTotal}`, status: 'POSTED' },
        create: { companyId: company.id, supplierId: supplierIds[(i-1)%10], referenceNumber: `${prefix}-PO-${String(i).padStart(4,'0')}`, subtotal: `${purchaseTotal}`, taxTotal: '0', grandTotal: `${purchaseTotal}`, status: 'POSTED' },
      });
      await db.purchaseItem.deleteMany({ where: { purchaseId: purchase.id } });
      await db.purchaseItem.create({ data: { purchaseId: purchase.id, productId: productIds[(i-1)%10], quantity: `${i}`, unitCost: `${100 + i * 10}`, lineTotal: `${purchaseTotal}` } });
    }

    // Ten auditable demo actions per company.
    await db.auditLog.deleteMany({ where: { companyId: company.id, action: 'SEED_DEMO' } });
    for (let i = 0; i < 10; i++) await db.auditLog.create({ data: {
      userId: users.get('owner@myexample.com')!.id, companyId: company.id, action: 'SEED_DEMO', entity: 'DemoRecord', entityId: productIds[i], metadata: { record: i + 1, source: 'SalePro demo seed' },
    }});
  }

  console.log('Salla database seed completed. Each company has 10 branches, warehouses, categories, products, customers, suppliers, stock movements, sales, purchase orders and audit records.');
  console.log('Demo users: owner@myexample.com, company@example.com, company@example1.com, companyuser@example.com, companyuser@example1.com');
  console.log('Demo password for all accounts: password');
}

main().catch((error) => { console.error('Salla seed failed:', error); process.exitCode = 1; }).finally(async () => { await db.$disconnect(); });
