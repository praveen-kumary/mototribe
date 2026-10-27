import { PrismaClient, UserRole, SellerStatus, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.post.deleteMany();
  await prisma.community.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Database...');

  const defaultPassword = await bcrypt.hash('password', 10);

  // 1. Create Users
  const rider = await prisma.user.create({
    data: {
      email: 'rider@mototribe.demo',
      name: 'Rider 07',
      passwordHash: defaultPassword,
      role: UserRole.RIDER,
      xp: 1840,
      level: 12,
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: 'seller@mototribe.demo',
      name: 'MotoMagix',
      passwordHash: defaultPassword,
      role: UserRole.SELLER,
      sellerStatus: SellerStatus.APPROVED,
      storeName: 'MotoMagix',
      storeSlug: 'motomagix',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'trailworks@mototribe.demo',
      name: 'TrailWorks',
      passwordHash: defaultPassword,
      role: UserRole.SELLER,
      sellerStatus: SellerStatus.APPROVED,
      storeName: 'TrailWorks',
      storeSlug: 'trailworks',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mototribe.demo',
      name: 'MotoTribe Admin',
      passwordHash: defaultPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('Users created.');

  // 2. Create Products
  await prisma.product.createMany({
    data: [
      {
        sellerId: seller2.id,
        name: 'Ladder Performance Crash Guard',
        slug: 'ladder-crash-guard-himalayan-450',
        description: 'Heavy-duty tubular crash guard engineered for everyday city riding and long-distance touring.',
        price: 449900, // paise
        comparePrice: 599900,
        stock: 15,
        status: ProductStatus.ACTIVE,
        category: 'Protection',
      },
      {
        sellerId: seller1.id,
        name: 'Ridge Pro Phone Mount',
        slug: 'ridge-pro-phone-mount',
        description: 'Vibration-dampened aluminium phone mount for navigation without the wobble.',
        price: 214900, // paise
        comparePrice: 299900,
        stock: 120,
        status: ProductStatus.ACTIVE,
        category: 'Accessories',
      },
      {
        sellerId: seller1.id,
        name: 'Viaterra Claw Tail Bag',
        slug: 'viaterra-claw-tail-bag',
        description: 'The classic Claw tail bag, perfect for all tail racks.',
        price: 420000, // paise
        comparePrice: 450000,
        stock: 8,
        status: ProductStatus.ACTIVE,
        category: 'Luggage',
      },
    ],
  });
  
  // Create product images manually since createMany doesn't support nested writes
  const crashGuard = await prisma.product.findUnique({ where: { slug: 'ladder-crash-guard-himalayan-450' }});
  const phoneMount = await prisma.product.findUnique({ where: { slug: 'ridge-pro-phone-mount' }});
  const tailBag = await prisma.product.findUnique({ where: { slug: 'viaterra-claw-tail-bag' }});

  if (crashGuard) await prisma.productImage.create({ data: { productId: crashGuard.id, url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80' }});
  if (phoneMount) await prisma.productImage.create({ data: { productId: phoneMount.id, url: 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=800&q=80' }});
  if (tailBag) await prisma.productImage.create({ data: { productId: tailBag.id, url: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=800&q=80' }});


  console.log('Products created.');

  // 3. Create Communities & Posts
  const comm1 = await prisma.community.create({
    data: {
      name: 'Himalayan Owners',
      slug: 'himalayan-owners',
      description: 'A community for Royal Enfield Himalayan owners.',
    },
  });

  await prisma.post.create({
    data: {
      communityId: comm1.id,
      authorId: rider.id,
      title: 'Himalayan 450 First Service Cost?',
      body: 'Hey folks, just hit 500km on my new Himalayan 450. What did you guys pay for the first service?',
      score: 120,
    },
  });

  console.log('Community data created.');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
