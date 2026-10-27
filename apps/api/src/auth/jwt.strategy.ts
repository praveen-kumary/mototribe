import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import Redis from "ioredis";
import { REDIS_CLIENT } from "../common/redis.module";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  sessionId?: string;
}

function extractAccessToken(req: Request): string | null {
  const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (bearer) return bearer;

  const cookieToken = req.cookies?.["accessToken"];
  return cookieToken || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    const secret = config.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    super({
      jwtFromRequest: extractAccessToken,
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.sessionId) {
      throw new UnauthorizedException();
    }

    const sessionActive = await this.redis.get(
      `session:${payload.sub}:${payload.sessionId}`,
    );
    if (!sessionActive) {
      throw new UnauthorizedException("Session revoked or expired");
    }

    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
