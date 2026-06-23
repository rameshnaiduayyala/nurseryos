import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Clean existing data (in correct order of relations)
  console.log('Cleaning existing data...');
  await prisma.posSaleItem.deleteMany({});
  await prisma.posSale.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.farmerLedger.deleteMany({});
  await prisma.customerLedger.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.supervisor.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.procurementOrderItem.deleteMany({});
  await prisma.procurementOrder.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventoryBatch.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.plant.deleteMany({});
  await prisma.heightStandard.deleteMany({});
  await prisma.bagSize.deleteMany({});
  await prisma.plantVariety.deleteMany({});
  await prisma.plantCategory.deleteMany({});
  await prisma.nurseryBlock.deleteMany({});
  await prisma.nursery.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // 2. Create Roles
  console.log('Seeding roles...');
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN' } });
  const farmerRole = await prisma.role.create({ data: { name: 'FARMER' } });
  const exporterRole = await prisma.role.create({ data: { name: 'EXPORTER' } });
  const supervisorRole = await prisma.role.create({ data: { name: 'SUPERVISOR' } });

  // 3. Create Users
  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('Password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nurseryos.com',
      passwordHash,
      fullName: 'Alice Administrator',
      roleId: adminRole.id,
    },
  });

  const farmerUser = await prisma.user.create({
    data: {
      email: 'farmer@nurseryos.com',
      passwordHash,
      fullName: 'Bob Farmer',
      roleId: farmerRole.id,
    },
  });

  const exporterUser = await prisma.user.create({
    data: {
      email: 'exporter@nurseryos.com',
      passwordHash,
      fullName: 'Charlie Exporter',
      roleId: exporterRole.id,
    },
  });

  const supervisorUser = await prisma.user.create({
    data: {
      email: 'supervisor@nurseryos.com',
      passwordHash,
      fullName: 'David Supervisor',
      roleId: supervisorRole.id,
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      email: 'driver@nurseryos.com',
      passwordHash,
      fullName: 'Earl Driver',
      roleId: supervisorRole.id,
    },
  });

  // 4. Create Driver & Supervisor profiles
  console.log('Seeding profiles...');
  const driverProfile = await prisma.driver.create({
    data: {
      userId: driverUser.id,
      licenseNumber: 'DL-98218-USA',
      status: 'AVAILABLE',
    },
  });

  const supervisorProfile = await prisma.supervisor.create({
    data: {
      userId: supervisorUser.id,
    },
  });

  // 5. Create Nursery and Blocks with GPS coordinates
  console.log('Seeding nurseries & blocks with GPS...');
  const nursery = await prisma.nursery.create({
    data: {
      name: 'Evergreen Valleys Nursery',
      location: 'Oregon Valley Area 4',
      address: '400 Valley View Rd, OR',
      gst: 'GST123456789',
      contactPerson: 'Bob Farmer Contact',
      latitude: 45.3,
      longitude: -122.6,
      farmerId: farmerUser.id,
      isApproved: true,
    },
  });

  // Add another nearby nursery for route testing
  const nurseryB = await prisma.nursery.create({
    data: {
      name: 'Silver Falls Plant Nursery',
      location: 'Silver Falls State Park',
      address: '200 Falls Rd, OR',
      gst: 'GST987654321',
      contactPerson: 'Sarah Jenkins',
      latitude: 44.8,
      longitude: -122.7,
      farmerId: farmerUser.id,
      isApproved: true,
    },
  });

  const blockA = await prisma.nurseryBlock.create({
    data: {
      name: 'Block A (Greenhouses)',
      nurseryId: nursery.id,
    },
  });

  const blockB = await prisma.nurseryBlock.create({
    data: {
      name: 'Block B (Outdoor Shade)',
      nurseryId: nursery.id,
    },
  });

  // 6. Create Plant categories, varieties, sizes, height standards, and plants
  console.log('Seeding plant categories, varieties & bag sizes...');
  const shadeCategory = await prisma.plantCategory.create({ data: { name: 'Shade Plants' } });
  const flowerCategory = await prisma.plantCategory.create({ data: { name: 'Flowering Shrubs' } });

  const varietyFicus = await prisma.plantVariety.create({
    data: { name: 'Ficus Lyrata', categoryId: shadeCategory.id },
  });

  const varietyHydrangea = await prisma.plantVariety.create({
    data: { name: 'Hydrangea Macrophylla', categoryId: flowerCategory.id },
  });

  const size5L = await prisma.bagSize.create({ data: { size: '5L Bag' } });
  const size10L = await prisma.bagSize.create({ data: { size: '10L Bag' } });

  console.log('Seeding height standards...');
  const ht2ft = await prisma.heightStandard.create({ data: { name: '2 ft' } });
  const ht6ft = await prisma.heightStandard.create({ data: { name: '6 ft' } });

  console.log('Seeding plants...');
  const fiddleFig = await prisma.plant.create({
    data: {
      name: 'Fiddle-leaf Fig',
      categoryId: shadeCategory.id,
      varietyId: varietyFicus.id,
      bagSizeId: size10L.id,
      heightStandardId: ht6ft.id,
      description: 'Elegant ornamental indoor foliage tree',
      unitPrice: 24.99,
      farmerId: farmerUser.id,
    },
  });

  const hydrangea = await prisma.plant.create({
    data: {
      name: 'Bigleaf Hydrangea',
      categoryId: flowerCategory.id,
      varietyId: varietyHydrangea.id,
      bagSizeId: size5L.id,
      heightStandardId: ht2ft.id,
      description: 'Stunning mophead flowers blooming blue and pink',
      unitPrice: 15.50,
      farmerId: farmerUser.id,
    },
  });

  // 7. Seed Inventory Batches
  console.log('Seeding inventory batches...');
  const batch1 = await prisma.inventoryBatch.create({
    data: {
      nurseryBlockId: blockA.id,
      plantId: fiddleFig.id,
      quantity: 150,
      availableQuantity: 150,
      unitPrice: 22.00,
      status: 'AVAILABLE',
    },
  });

  await prisma.inventoryTransaction.create({
    data: {
      inventoryBatchId: batch1.id,
      type: 'IN',
      quantity: 150,
      description: 'Seeded initial batch',
    },
  });

  const batch2 = await prisma.inventoryBatch.create({
    data: {
      nurseryBlockId: blockB.id,
      plantId: hydrangea.id,
      quantity: 300,
      availableQuantity: 300,
      unitPrice: 14.00,
      status: 'AVAILABLE',
    },
  });

  await prisma.inventoryTransaction.create({
    data: {
      inventoryBatchId: batch2.id,
      type: 'IN',
      quantity: 300,
      description: 'Seeded initial batch',
    },
  });

  // 8. Vehicles
  console.log('Seeding vehicles...');
  await prisma.vehicle.create({
    data: {
      licensePlate: 'CA-992-OS',
      model: 'Ford F-350 Cargo Flatbed',
      capacity: 1200,
      status: 'AVAILABLE',
    },
  });

  // 9. Customers
  console.log('Seeding customers...');
  await prisma.customer.create({
    data: {
      name: 'Eco Landscape Architects Corp',
      email: 'procurement@ecolandscape.org',
      phone: '+1-503-555-0199',
      address: '900 Main St, Portland, OR 97201',
      type: 'LANDSCAPER',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
