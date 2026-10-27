import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsInt, Min, Max, MinLength, MaxLength, IsUUID } from "class-validator";

// ─── Disputes ────────────────────────────────────────────────
export class UpdateDisputeStatusDto {
  @IsString()
  @IsEnum(["OPEN", "IN_REVIEW", "AWAITING_RESPONSE", "RESOLVED", "CLOSED", "ESCALATED"])
  status: string;
}

// ─── Coupons ─────────────────────────────────────────────────
export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code: string;

  @IsString()
  @IsEnum(["PERCENTAGE", "FLAT"])
  type: string;

  @IsNumber()
  @Min(1)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderVal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsString()
  validFrom?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;
}

export class ToggleCouponStatusDto {
  @IsBoolean()
  active: boolean;
}

// ─── Returns ─────────────────────────────────────────────────
export class UpdateReturnStatusDto {
  @IsString()
  @IsEnum(["RETURN_APPROVED", "RETURN_PICKED", "RETURN_COMPLETED", "REFUND_PENDING", "REFUNDED", "RETURN_REJECTED"])
  status: string;
}

// ─── Payouts ─────────────────────────────────────────────────
export class RequestPayoutDto {
  @IsNumber()
  @Min(100) // minimum ₹1 (100 paise)
  amount: number;
}

export class UpdatePayoutStatusDto {
  @IsString()
  @IsEnum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"])
  status: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

// ─── Marketing ───────────────────────────────────────────────
export class CreateCampaignDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsEnum(["BANNER_AD", "SPONSORED_LISTING", "EMAIL_CAMPAIGN", "PUSH_NOTIFICATION", "SOCIAL_MEDIA"])
  type: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class UpdateCampaignStatusDto {
  @IsString()
  @IsEnum(["ACTIVE", "PAUSED", "ENDED", "DRAFT"])
  status: string;
}

// ─── Shipping ────────────────────────────────────────────────
export class CreateShippingProfileDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(0)
  baseRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perKgRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;
}

export class UpdateShippingActiveDto {
  @IsBoolean()
  active: boolean;
}

// ─── Events ──────────────────────────────────────────────────
export class CreateEventDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;
}

export class UpdateEventStatusDto {
  @IsString()
  @IsEnum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"])
  status: string;
}

// ─── Blog ────────────────────────────────────────────────────
export class CreateBlogDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  @IsEnum(["DRAFT", "PUBLISHED"])
  status?: string;
}

export class UpdateBlogStatusDto {
  @IsString()
  @IsEnum(["DRAFT", "PUBLISHED", "ARCHIVED"])
  status: string;
}

// ─── Reviews ─────────────────────────────────────────────────
export class UpdateReviewStatusDto {
  @IsString()
  @IsEnum(["APPROVED", "REJECTED", "FLAGGED", "HIDDEN"])
  status: string;
}

// ─── Creators ────────────────────────────────────────────────
export class UpdateCreatorStatusDto {
  @IsString()
  @IsEnum(["APPROVED", "REJECTED", "SUSPENDED", "PENDING"])
  status: string;
}

// ─── Settings ────────────────────────────────────────────────
export class UpdateSettingDto {
  value: any; // Settings can be any type
}

// ─── Common ──────────────────────────────────────────────────
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
