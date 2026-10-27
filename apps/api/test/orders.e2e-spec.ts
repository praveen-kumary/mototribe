import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

/**
 * Orders Module E2E Tests
 *
 * Focused tests for the orders endpoints, verifying auth guard enforcement
 * and proper v1 prefix routing.
 */
describe('OrdersModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/orders/my-orders → unauthorized without token → 401', () => {
    return request(app.getHttpServer())
      .get('/v1/orders/my-orders')
      .expect(401);
  });

  it('GET /v1/orders/seller-orders → unauthorized without token → 401', () => {
    return request(app.getHttpServer())
      .get('/v1/orders/seller-orders')
      .expect(401);
  });

  it('PATCH /v1/orders/:id/status → unauthorized without token → 401', () => {
    return request(app.getHttpServer())
      .patch('/v1/orders/some-order-id/status')
      .send({ status: 'CONFIRMED' })
      .expect(401);
  });
});
