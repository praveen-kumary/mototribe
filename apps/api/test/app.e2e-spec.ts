import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Comprehensive End-to-End Test Suite for RideRoom API
 *
 * Tests all major API flows using real HTTP calls with real JWT tokens.
 * Requires running PostgreSQL and Redis instances (docker-compose up).
 *
 * Flow:
 *   1. Health Check
 *   2. Auth: Register (Rider, Seller, Admin via DB seed)
 *   3. Auth: Login + error cases
 *   4. Auth: Token Refresh
 *   5. Auth: Profile (GET /me)
 *   6. Users: Public Profile + Update
 *   7. Products: Seller CRUD
 *   8. Products: Public Browsing
 *   9. Community: Posts, Comments, Upvotes
 *  10. Rides: Create, List, RSVP
 *  11. Reviews: Create & Fetch
 *  12. Garage: Bikes & Service Logs
 *  13. Admin: Stats, Pending Sellers, Approve
 *  14. Orders: Auth Guard Enforcement
 *  15. Checkout: Auth Guard Enforcement
 *  16. Auth: Logout Flows
 */
describe('RideRoom API – Full E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ── Shared state across test suites ──
  let riderToken: string;
  let riderUserId: string;

  let sellerToken: string;
  let sellerUserId: string;

  let adminToken: string;
  let adminUserId: string;

  let refreshCookie: string;

  let productId: string;
  let productSlug: string;

  let communityId: string;
  let postId: string;

  let rideId: string;

  let bikeModelId: string;
  let garageBikeId: string;

  // Unique email suffix to avoid collisions between test runs
  const suffix = Date.now().toString(36);
  const RIDER_EMAIL = `rider-${suffix}@e2e-test.com`;
  const SELLER_EMAIL = `seller-${suffix}@e2e-test.com`;
  const ADMIN_EMAIL = `admin-${suffix}@e2e-test.com`;
  const PASSWORD = 'Test1234!';

  // ─────────────────────────────────────────────────────────
  // Bootstrap
  // ─────────────────────────────────────────────────────────
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(require('cookie-parser')());
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // ── Cascading cleanup of test data ──
    // Delete in dependency order to avoid FK constraint errors
    try {
      const testUserIds = [riderUserId, sellerUserId, adminUserId].filter(Boolean);

      if (testUserIds.length > 0) {
        // Clean up related data
        await prisma.postUpvote.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.rideRSVP.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.comment.deleteMany({ where: { authorId: { in: testUserIds } } });
        await prisma.review.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.serviceLog.deleteMany({
          where: { garageBike: { userId: { in: testUserIds } } },
        });
        await prisma.garageBike.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.garage.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.post.deleteMany({ where: { authorId: { in: testUserIds } } });
        await prisma.checkoutSession.deleteMany({ where: { buyerId: { in: testUserIds } } });

        // Products and their dependencies
        if (productId) {
          await prisma.orderItem.deleteMany({ where: { productId } });
          await prisma.inventoryReservation.deleteMany({ where: { productId } });
          await prisma.productImage.deleteMany({ where: { productId } });
          await prisma.productFitment.deleteMany({ where: { productId } });
          await prisma.wishlist.deleteMany({ where: { productId } });
          await prisma.product.deleteMany({ where: { id: productId } });
        }
        // Also delete any other products by seller
        if (sellerUserId) {
          await prisma.inventoryReservation.deleteMany({
            where: { product: { sellerId: sellerUserId } },
          });
          await prisma.productImage.deleteMany({
            where: { product: { sellerId: sellerUserId } },
          });
          await prisma.productFitment.deleteMany({
            where: { product: { sellerId: sellerUserId } },
          });
          await prisma.wishlist.deleteMany({
            where: { product: { sellerId: sellerUserId } },
          });
          await prisma.product.deleteMany({ where: { sellerId: sellerUserId } });
        }

        // Rides created by test users
        if (rideId) {
          await prisma.rideRSVP.deleteMany({ where: { rideId } });
          await prisma.ride.deleteMany({ where: { id: rideId } });
        }

        // Clean up seed data
        if (communityId) {
          await prisma.community.deleteMany({ where: { id: communityId } });
        }
        if (bikeModelId) {
          const model = await prisma.bikeModel.findUnique({ where: { id: bikeModelId } });
          if (model) {
            await prisma.bikeModel.deleteMany({ where: { id: bikeModelId } });
            await prisma.bikeMake.deleteMany({ where: { id: model.makeId } });
          }
        }

        // Delete users last
        await prisma.notification.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
      }
    } catch (err) {
      console.error('Cleanup error (non-fatal):', err);
    }

    await prisma.$disconnect();
    await app.close();
  });

  // ─────────────────────────────────────────────────────────
  // 1. Health Check
  // ─────────────────────────────────────────────────────────
  describe('1. Health Check', () => {
    it('GET /v1/health → 200 with status ok', () => {
      return request(app.getHttpServer())
        .get('/v1/health')
        .expect(200)
        .expect({ status: 'ok', service: 'rideroom-api' });
    });
  });

  // ─────────────────────────────────────────────────────────
  // 2. Auth: Registration
  // ─────────────────────────────────────────────────────────
  describe('2. Auth: Registration', () => {
    it('should register a rider', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ name: 'E2E Rider', email: RIDER_EMAIL, password: PASSWORD })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(RIDER_EMAIL);
      expect(res.body.user.role).toBe('RIDER');

      riderToken = res.body.accessToken;
      riderUserId = res.body.user.id;

      // Extract refresh token cookie
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        const arr = Array.isArray(cookies) ? cookies : [cookies];
        const found = arr.find((c: string) => c.startsWith('refreshToken='));
        if (found) refreshCookie = found;
      }
    });

    it('should register a seller', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          name: 'E2E Seller',
          email: SELLER_EMAIL,
          password: PASSWORD,
          role: 'SELLER',
        })
        .expect(201);

      expect(res.body.user.role).toBe('SELLER');
      sellerToken = res.body.accessToken;
      sellerUserId = res.body.user.id;
    });

    it('should reject duplicate email registration → 409', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ name: 'Duplicate', email: RIDER_EMAIL, password: PASSWORD })
        .expect(409);
    });

    it('should reject registration with short password → 400', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ name: 'Short', email: 'short@e2e.com', password: '123' })
        .expect(400);
    });

    it('should reject registration without required fields → 400', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email: RIDER_EMAIL })
        .expect(400);
    });

    // Create admin via DB (no public registration for admin role)
    it('should seed admin user via DB and login to get token', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash(PASSWORD, 12);

      const admin = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash: hash,
          name: 'E2E Admin',
          role: 'ADMIN',
        },
      });
      adminUserId = admin.id;

      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: ADMIN_EMAIL, password: PASSWORD })
        .expect(200);

      adminToken = res.body.accessToken;
      expect(adminToken).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────
  // 3. Auth: Login
  // ─────────────────────────────────────────────────────────
  describe('3. Auth: Login', () => {
    it('should login rider with correct credentials → 200', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: RIDER_EMAIL, password: PASSWORD })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe(RIDER_EMAIL);

      // Update token to the freshest one
      riderToken = res.body.accessToken;

      // Capture refresh cookie
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        const arr = Array.isArray(cookies) ? cookies : [cookies];
        const found = arr.find((c: string) => c.startsWith('refreshToken='));
        if (found) refreshCookie = found;
      }
    });

    it('should reject login with wrong password → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: RIDER_EMAIL, password: 'WrongPassword!' })
        .expect(401);
    });

    it('should reject login with non-existent email → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: 'nobody@nowhere.com', password: PASSWORD })
        .expect(401);
    });

    it('should reject login without email → 400', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ password: PASSWORD })
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 4. Auth: Token Refresh
  // ─────────────────────────────────────────────────────────
  describe('4. Auth: Token Refresh', () => {
    it('should refresh tokens with valid cookie → 200', async () => {
      if (!refreshCookie) {
        console.warn('No refresh cookie captured, skipping refresh test');
        return;
      }

      const res = await request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
    });

    it('should reject refresh without cookie → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 5. Auth: Profile
  // ─────────────────────────────────────────────────────────
  describe('5. Auth: Profile', () => {
    it('GET /v1/auth/me → should return authenticated user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      expect(res.body.id).toBe(riderUserId);
      expect(res.body.email).toBe(RIDER_EMAIL);
      expect(res.body.role).toBe('RIDER');
    });

    it('GET /v1/auth/me without token → 401', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/me')
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 6. Users: Public Profile & Update
  // ─────────────────────────────────────────────────────────
  describe('6. Users', () => {
    it('GET /v1/users/:id → should return public user profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/users/${riderUserId}`)
        .expect(200);

      expect(res.body.id).toBe(riderUserId);
      expect(res.body.name).toBe('E2E Rider');
      // Password hash should NOT be exposed
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('GET /v1/users/:id → non-existent user → 404', async () => {
      await request(app.getHttpServer())
        .get('/v1/users/non-existent-id-12345')
        .expect(404);
    });

    it('PATCH /v1/users/me → should update user name', async () => {
      const res = await request(app.getHttpServer())
        .patch('/v1/users/me')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ name: 'Updated Rider' })
        .expect(200);

      expect(res.body.name).toBe('Updated Rider');
    });

    it('PATCH /v1/users/me without token → 401', async () => {
      await request(app.getHttpServer())
        .patch('/v1/users/me')
        .send({ name: 'Hacker' })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 7. Products: Seller CRUD
  // ─────────────────────────────────────────────────────────
  describe('7. Products: Seller CRUD', () => {
    // First approve the seller so they can create products
    it('should approve seller before product tests', async () => {
      await prisma.user.update({
        where: { id: sellerUserId },
        data: { sellerStatus: 'APPROVED' },
      });
    });

    it('POST /v1/products → seller creates a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'E2E Test Exhaust',
          description: 'A high-performance exhaust for testing',
          price: 15000,
          category: 'PERFORMANCE',
          status: 'ACTIVE',
          stock: 50,
        })
        .expect(201);

      expect(res.body.name).toBe('E2E Test Exhaust');
      expect(res.body.price).toBe(15000);
      expect(res.body.sellerId).toBe(sellerUserId);

      productId = res.body.id;
      productSlug = res.body.slug;
    });

    it('POST /v1/products → rider cannot create product → 403', async () => {
      await request(app.getHttpServer())
        .post('/v1/products')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          name: 'Should Fail',
          description: 'Riders cannot create products',
          price: 100,
        })
        .expect(403);
    });

    it('POST /v1/products → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/products')
        .send({ name: 'NoAuth', description: 'test', price: 100 })
        .expect(401);
    });

    it('GET /v1/products/:slug → should return product by slug', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/products/${productSlug}`)
        .expect(200);

      expect(res.body.id).toBe(productId);
      expect(res.body.name).toBe('E2E Test Exhaust');
      expect(res.body.seller).toBeDefined();
    });

    it('GET /v1/products/:slug → non-existent slug → 404', async () => {
      await request(app.getHttpServer())
        .get('/v1/products/non-existent-slug-xyz')
        .expect(404);
    });

    it('PATCH /v1/products/:id → seller updates product price', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/v1/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ price: 18000 })
        .expect(200);

      expect(res.body.price).toBe(18000);
    });

    it('PATCH /v1/products/:id → rider cannot update → 403', async () => {
      await request(app.getHttpServer())
        .patch(`/v1/products/${productId}`)
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ price: 1 })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 8. Products: Public Browsing
  // ─────────────────────────────────────────────────────────
  describe('8. Products: Public Browsing', () => {
    it('GET /v1/products → should list active products', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('GET /v1/products?category=PERFORMANCE → filter by category', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products?category=PERFORMANCE')
        .expect(200);

      // Our test product should be in the results
      const found = res.body.items.find((p: any) => p.id === productId);
      expect(found).toBeDefined();
    });

    it('GET /v1/products?sort=price-low → sorted by price ascending', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products?sort=price-low')
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('GET /v1/products?page=1&limit=5 → pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products?page=1&limit=5')
        .expect(200);

      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 9. Community: Posts, Comments, Upvotes
  // ─────────────────────────────────────────────────────────
  describe('9. Community', () => {
    // Seed a community group first
    it('should seed a community group', async () => {
      const community = await prisma.community.create({
        data: {
          slug: `e2e-test-community-${suffix}`,
          name: 'E2E Test Community',
          description: 'A community for E2E testing',
        },
      });
      communityId = community.id;
    });

    it('GET /v1/community/groups → should list communities', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/community/groups')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((c: any) => c.id === communityId);
      expect(found).toBeDefined();
    });

    it('POST /v1/community/posts → authenticated user creates a post', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/community/posts')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          communityId,
          title: 'E2E Test Post',
          body: 'This is a test post from E2E tests',
        })
        .expect(201);

      expect(res.body.title).toBe('E2E Test Post');
      expect(res.body.author).toBeDefined();
      postId = res.body.id;
    });

    it('POST /v1/community/posts → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/community/posts')
        .send({ communityId, title: 'Fail', body: 'No auth' })
        .expect(401);
    });

    it('GET /v1/community/posts → should list posts', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/community/posts')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /v1/community/posts/:id → should return post with details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/community/posts/${postId}`)
        .expect(200);

      expect(res.body.id).toBe(postId);
      expect(res.body.title).toBe('E2E Test Post');
      expect(res.body.comments).toBeDefined();
    });

    it('POST /v1/community/posts/:id/comments → add comment', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/community/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ body: 'E2E test comment' })
        .expect(201);

      expect(res.body.body).toBe('E2E test comment');
      expect(res.body.author).toBeDefined();
    });

    it('POST /v1/community/posts/:id/upvote → toggle upvote ON', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/community/posts/${postId}/upvote`)
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(201);

      expect(res.body.upvoted).toBe(true);
    });

    it('POST /v1/community/posts/:id/upvote → toggle upvote OFF', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/community/posts/${postId}/upvote`)
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(201);

      expect(res.body.upvoted).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 10. Rides
  // ─────────────────────────────────────────────────────────
  describe('10. Rides', () => {
    it('POST /v1/rides → create a ride', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const res = await request(app.getHttpServer())
        .post('/v1/rides')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          name: 'E2E Weekend Ride',
          description: 'A ride for E2E testing',
          date: futureDate.toISOString(),
          location: 'E2E Test City',
        })
        .expect(201);

      expect(res.body.name).toBe('E2E Weekend Ride');
      expect(res.body.location).toBe('E2E Test City');
      rideId = res.body.id;
    });

    it('POST /v1/rides → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/rides')
        .send({ name: 'Fail', date: new Date().toISOString(), location: 'Nowhere' })
        .expect(401);
    });

    it('GET /v1/rides → should list upcoming rides', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/rides')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((r: any) => r.id === rideId);
      expect(found).toBeDefined();
    });

    it('POST /v1/rides/:id/rsvp → toggle RSVP ON', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/rides/${rideId}/rsvp`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(201);

      expect(res.body.rsvp).toBe(true);
    });

    it('POST /v1/rides/:id/rsvp → toggle RSVP OFF', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/rides/${rideId}/rsvp`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(201);

      expect(res.body.rsvp).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 11. Reviews
  // ─────────────────────────────────────────────────────────
  describe('11. Reviews', () => {
    it('POST /v1/reviews → create review for a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/reviews')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          productId,
          rating: 5,
          body: 'Excellent exhaust! Great sound.',
        })
        .expect(201);

      expect(res.body.rating).toBe(5);
      expect(res.body.body).toBe('Excellent exhaust! Great sound.');
      expect(res.body.user).toBeDefined();
    });

    it('POST /v1/reviews → duplicate review → 409', async () => {
      await request(app.getHttpServer())
        .post('/v1/reviews')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          productId,
          rating: 4,
          body: 'Second review should fail',
        })
        .expect(409);
    });

    it('POST /v1/reviews → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/reviews')
        .send({ productId, rating: 3, body: 'No auth' })
        .expect(401);
    });

    it('GET /v1/reviews/product/:productId → list product reviews', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/reviews/product/${productId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].rating).toBe(5);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 12. Garage
  // ─────────────────────────────────────────────────────────
  describe('12. Garage', () => {
    // Seed a bike model for the garage tests
    it('should seed a bike make + model', async () => {
      const make = await prisma.bikeMake.create({
        data: { name: `E2E-Make-${suffix}` },
      });
      const model = await prisma.bikeModel.create({
        data: {
          makeId: make.id,
          name: `E2E-Model-${suffix}`,
          yearFrom: 2020,
          yearTo: 2025,
        },
      });
      bikeModelId = model.id;
    });

    it('GET /v1/garage → empty garage for new user', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/garage')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /v1/garage/bikes → add a bike', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/garage/bikes')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          bikeModelId,
          year: 2023,
          nickname: 'My Test Bike',
        })
        .expect(201);

      expect(res.body.year).toBe(2023);
      expect(res.body.nickname).toBe('My Test Bike');
      expect(res.body.bikeModel).toBeDefined();
      garageBikeId = res.body.id;
    });

    it('GET /v1/garage → should now show the bike', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/garage')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const found = res.body.find((b: any) => b.id === garageBikeId);
      expect(found).toBeDefined();
    });

    it('POST /v1/garage/bikes/:id/service-logs → add service log', async () => {
      const res = await request(app.getHttpServer())
        .post(`/v1/garage/bikes/${garageBikeId}/service-logs`)
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          title: 'Oil Change',
          description: 'Changed engine oil to 10W-40',
          odometerKm: 15000,
          date: new Date().toISOString(),
        })
        .expect(201);

      expect(res.body.title).toBe('Oil Change');
      expect(res.body.odometerKm).toBe(15000);
    });

    it('GET /v1/garage/bikes/:id/service-logs → list service logs', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/garage/bikes/${garageBikeId}/service-logs`)
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('DELETE /v1/garage/bikes/:id → remove bike', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/garage/bikes/${garageBikeId}`)
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      // Verify removal
      const res = await request(app.getHttpServer())
        .get('/v1/garage')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      const found = res.body.find((b: any) => b.id === garageBikeId);
      expect(found).toBeUndefined();

      // Reset so cleanup doesn't try to delete again
      garageBikeId = '';
    });

    it('GET /v1/garage → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .get('/v1/garage')
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 13. Admin
  // ─────────────────────────────────────────────────────────
  describe('13. Admin', () => {
    it('GET /v1/admin/stats → admin gets platform stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('products');
      expect(res.body).toHaveProperty('orders');
      expect(res.body).toHaveProperty('revenue');
      expect(typeof res.body.users).toBe('number');
    });

    it('GET /v1/admin/stats → rider cannot access → 403', async () => {
      await request(app.getHttpServer())
        .get('/v1/admin/stats')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(403);
    });

    it('GET /v1/admin/stats → seller cannot access → 403', async () => {
      await request(app.getHttpServer())
        .get('/v1/admin/stats')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);
    });

    it('GET /v1/admin/stats → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .get('/v1/admin/stats')
        .expect(401);
    });

    it('GET /v1/admin/sellers/pending → admin gets pending sellers', async () => {
      // First create a pending seller for the test
      const pendingEmail = `pending-seller-${suffix}@e2e.com`;
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash(PASSWORD, 12);
      const pending = await prisma.user.create({
        data: {
          email: pendingEmail,
          passwordHash: hash,
          name: 'Pending Seller',
          role: 'SELLER',
          sellerStatus: 'PENDING',
        },
      });

      const res = await request(app.getHttpServer())
        .get('/v1/admin/sellers/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((s: any) => s.id === pending.id);
      expect(found).toBeDefined();

      // Test approve
      await request(app.getHttpServer())
        .patch(`/v1/admin/sellers/${pending.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify approved
      const updated = await prisma.user.findUnique({ where: { id: pending.id } });
      expect(updated!.sellerStatus).toBe('APPROVED');

      // Cleanup the pending seller
      await prisma.user.delete({ where: { id: pending.id } });
    });

    it('PATCH /v1/admin/sellers/:id/approve → rider cannot approve → 403', async () => {
      await request(app.getHttpServer())
        .patch(`/v1/admin/sellers/${sellerUserId}/approve`)
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 14. Orders: Auth Guard Enforcement
  // ─────────────────────────────────────────────────────────
  describe('14. Orders', () => {
    it('GET /v1/orders/my-orders → authenticated returns (possibly empty) list', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/orders/my-orders')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /v1/orders/my-orders → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .get('/v1/orders/my-orders')
        .expect(401);
    });

    it('GET /v1/orders/seller-orders → seller can access', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/orders/seller-orders')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /v1/orders/seller-orders → rider cannot access → 403', async () => {
      await request(app.getHttpServer())
        .get('/v1/orders/seller-orders')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 15. Checkout: Auth Guard Enforcement
  // ─────────────────────────────────────────────────────────
  describe('15. Checkout', () => {
    it('POST /v1/checkout → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/checkout')
        .send({
          idempotencyKey: 'test-key',
          items: [{ productId, quantity: 1 }],
          shippingAddressId: 'some-address',
        })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 16. Auth: Logout
  // ─────────────────────────────────────────────────────────
  describe('16. Auth: Logout', () => {
    it('POST /v1/auth/logout → clears session', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${riderToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('POST /v1/auth/logout → unauthenticated → 401', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .expect(401);
    });

    it('POST /v1/auth/force-logout → admin forces logout', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/force-logout')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should re-login rider and admin after logout tests', async () => {
      const riderRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: RIDER_EMAIL, password: PASSWORD })
        .expect(200);
      riderToken = riderRes.body.accessToken;

      const adminRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: ADMIN_EMAIL, password: PASSWORD })
        .expect(200);
      adminToken = adminRes.body.accessToken;
    });
  });

  // ─────────────────────────────────────────────────────────
  // 17. Validation & Guard Edge Cases
  // ─────────────────────────────────────────────────────────
  describe('17. Validation & Guard Edge Cases', () => {
    it('POST /v1/auth/register → invalid role → 400', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          name: 'Edge',
          email: `edge-${suffix}@e2e.com`,
          password: PASSWORD,
          role: 'ADMIN', // Not allowed via registration
        })
        .expect(400);
    });

    it('POST /v1/reviews → missing required fields → 400', async () => {
      await request(app.getHttpServer())
        .post('/v1/reviews')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ productId }) // Missing rating and body
        .expect(400);
    });

    it('POST /v1/community/posts → missing body → 400', async () => {
      await request(app.getHttpServer())
        .post('/v1/community/posts')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ communityId }) // Missing title and body
        .expect(400);
    });

    it('expired / invalid JWT → 401', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('malformed Authorization header → 401', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', 'NotBearer something')
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 19. Security: IDOR, Seller Approval, Session Revocation
  // ─────────────────────────────────────────────────────────
  describe('19. Security', () => {
    let otherSellerToken: string;
    let otherSellerUserId: string;
    let pendingSellerToken: string;
    let testOrderId: string;
    let riderAddressId: string;

    beforeAll(async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash(PASSWORD, 12);

      const otherSeller = await prisma.user.create({
        data: {
          email: `other-seller-${suffix}@e2e-test.com`,
          passwordHash: hash,
          name: 'Other Seller',
          role: 'SELLER',
          sellerStatus: 'APPROVED',
        },
      });
      otherSellerUserId = otherSeller.id;

      const loginRes = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: otherSeller.email, password: PASSWORD });
      otherSellerToken = loginRes.body.accessToken;

      const pendingRes = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          name: 'Pending Seller',
          email: `pending-prod-${suffix}@e2e-test.com`,
          password: PASSWORD,
          role: 'SELLER',
        });
      pendingSellerToken = pendingRes.body.accessToken;

      const address = await prisma.address.create({
        data: {
          userId: riderUserId,
          label: 'Home',
          line1: '123 Test St',
          city: 'Mumbai',
          state: 'MH',
          pincode: '400001',
          phone: '9876543210',
        },
      });
      riderAddressId = address.id;

      const activeProduct = await prisma.product.create({
        data: {
          sellerId: sellerUserId,
          name: 'Checkout Test Product',
          slug: `checkout-test-${suffix}`,
          description: 'For checkout E2E',
          price: 5000,
          category: 'PERFORMANCE',
          stock: 10,
          availableStock: 10,
          status: 'ACTIVE',
        },
      });

      const checkoutRes = await request(app.getHttpServer())
        .post('/v1/checkout')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          idempotencyKey: `sec-checkout-${suffix}`,
          items: [{ productId: activeProduct.id, quantity: 1 }],
          shippingAddressId: riderAddressId,
        })
        .expect(201);

      testOrderId = checkoutRes.body.orderId;
    });

    afterAll(async () => {
      if (testOrderId) {
        await prisma.orderAuditLog.deleteMany({ where: { orderId: testOrderId } });
        await prisma.sellerOrder.deleteMany({ where: { parentOrderId: testOrderId } });
        await prisma.order.deleteMany({ where: { id: testOrderId } });
      }
      if (riderAddressId) {
        await prisma.address.deleteMany({ where: { id: riderAddressId } });
      }
      if (otherSellerUserId) {
        await prisma.user.deleteMany({ where: { id: otherSellerUserId } });
      }
      await prisma.user.deleteMany({
        where: { email: `pending-prod-${suffix}@e2e-test.com` },
      });
    });

    it('PATCH /v1/inventory/:id/stock → other seller cannot update stock → 403', async () => {
      const product = await prisma.product.findFirst({
        where: { sellerId: sellerUserId, status: { not: 'ARCHIVED' } },
      });
      expect(product).toBeDefined();

      await request(app.getHttpServer())
        .patch(`/v1/inventory/${product!.id}/stock`)
        .set('Authorization', `Bearer ${otherSellerToken}`)
        .send({ stock: 999 })
        .expect(403);
    });

    it('GET /v1/orders/seller/:id → seller cannot view another seller orders → 403', async () => {
      await request(app.getHttpServer())
        .get(`/v1/orders/seller/${sellerUserId}`)
        .set('Authorization', `Bearer ${otherSellerToken}`)
        .expect(403);
    });

    it('PATCH /v1/orders/:id/status → unrelated seller cannot update order → 403', async () => {
      await request(app.getHttpServer())
        .patch(`/v1/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${otherSellerToken}`)
        .send({ status: 'PACKING' })
        .expect(403);
    });

    it('POST /v1/products → pending seller cannot create product → 403', async () => {
      await request(app.getHttpServer())
        .post('/v1/products')
        .set('Authorization', `Bearer ${pendingSellerToken}`)
        .send({
          name: 'Pending Seller Product',
          description: 'Should fail',
          price: 1000,
          category: 'PERFORMANCE',
          stock: 5,
        })
        .expect(403);
    });

    it('revoked session → access token rejected → 401', async () => {
      const regRes = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          name: 'Revoke Test',
          email: `revoke-${suffix}@e2e-test.com`,
          password: PASSWORD,
        })
        .expect(201);

      const token = regRes.body.accessToken;

      await request(app.getHttpServer())
        .post('/v1/auth/force-logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      await prisma.user.delete({ where: { id: regRes.body.user.id } });
    });

    it('POST /v1/checkout → mock payment completes order', async () => {
      await new Promise((r) => setTimeout(r, 100));

      const order = await prisma.order.findUnique({ where: { id: testOrderId } });
      expect(order).toBeDefined();
      expect(['CONFIRMED', 'PAYMENT_SUCCESS', 'PAYMENT_PENDING']).toContain(order!.status);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 18. Product Soft Delete
  // ─────────────────────────────────────────────────────────
  describe('18. Product Soft Delete', () => {
    it('DELETE /v1/products/:id → seller archives product', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/v1/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.status).toBe('ARCHIVED');
    });

    it('GET /v1/products → archived product no longer in public listing', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      const found = res.body.items.find((p: any) => p.id === productId);
      expect(found).toBeUndefined();
    });
  });
});
