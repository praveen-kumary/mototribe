import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto, LoginDto } from "./auth.dto";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { REDIS_CLIENT } from "../common/redis.module";

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role ?? "RIDER",
        sellerStatus: dto.role === "SELLER" ? "PENDING" : undefined,
      },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const secret = this.config.get<string>("JWT_REFRESH_SECRET");
      if (!secret) {
        throw new UnauthorizedException("Refresh secret not configured");
      }

      const payload = this.jwt.verify(refreshToken, { secret });

      // Verify session exists in Redis
      const sessionActive = await this.redis.get(`session:${payload.sub}:${payload.sessionId}`);
      if (!sessionActive) {
        throw new UnauthorizedException("Session revoked or expired");
      }

      // Rotate session: Delete old
      await this.redis.del(`session:${payload.sub}:${payload.sessionId}`);

      return await this.issueTokens(payload.sub, payload.email, payload.role);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        xp: true,
        level: true,
        sellerStatus: true,
        storeName: true,
        storeSlug: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return user;
  }

  async logout(userId: string, sessionId: string) {
    if (sessionId) {
      await this.redis.del(`session:${userId}:${sessionId}`);
    }
  }

  async forceLogoutAllDevices(userId: string) {
    // Use SCAN instead of KEYS to avoid blocking Redis
    const pattern = `session:${userId}:*`;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const sessionId = uuidv4();
    const payload = { sub: userId, email, role, sessionId };

    const jwtSecret = this.config.get<string>("JWT_SECRET");
    const refreshSecret = this.config.get<string>("JWT_REFRESH_SECRET");

    if (!jwtSecret) throw new Error("JWT_SECRET is required");
    if (!refreshSecret) throw new Error("JWT_REFRESH_SECRET is required");

    const accessToken = this.jwt.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: "7d",
      secret: refreshSecret,
    });

    // Store session in Redis for 7 days
    await this.redis.set(`session:${userId}:${sessionId}`, 'active', 'EX', 7 * 24 * 60 * 60);

    return { accessToken, refreshToken, user: { id: userId, email, role } };
  }
}
