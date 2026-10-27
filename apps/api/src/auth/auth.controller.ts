import { Body, Controller, Get, Post, UseGuards, Res, Req, HttpCode, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "./auth.dto";
import { CurrentUser } from "../common/decorators";
import { Response, Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Throttle({ auth: { limit: 20, ttl: 60000 } })
  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.["refreshToken"];
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided");
    }
    const result = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post("logout")
  @HttpCode(200)
  @UseGuards(AuthGuard("jwt"))
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @CurrentUser() user: any) {
    if (user?.sessionId) {
      await this.authService.logout(user.id, user.sessionId);
    }
    this.clearAuthCookies(res);
    return { success: true };
  }

  @Post("force-logout")
  @HttpCode(200)
  @UseGuards(AuthGuard("jwt"))
  async forceLogout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.forceLogoutAllDevices(user.id);
    this.clearAuthCookies(res);
    return { success: true };
  }

  @SkipThrottle()
  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  me(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }
}
