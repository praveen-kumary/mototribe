import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Determine the platform fee percentage dynamically based on the seller's tier and product category.
   * Falls back to a global default if no specific rule matches.
   */
  async getCommissionPercentage(sellerId: string, category: string): Promise<number> {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { sellerStatus: true }, // Ideally we'd have a 'tier' field, using status for now
    });

    const tier = seller?.sellerStatus === "APPROVED" ? "STANDARD" : "GUEST";

    // 1. Try to find a specific rule for this tier and category
    let rule = await this.prisma.commissionRule.findUnique({
      where: { sellerTier_category: { sellerTier: tier, category } },
    });

    // 2. Fall back to the generic rule for this tier
    if (!rule) {
      rule = await this.prisma.commissionRule.findUnique({
        where: { sellerTier_category: { sellerTier: tier, category: "ALL" } },
      });
    }

    // 3. Absolute fallback to 5% if no DB configuration is found
    if (!rule || !rule.active) {
      return 5.0; 
    }

    return rule.percentage;
  }

  /**
   * Fetch a global platform configuration.
   */
  async getPlatformConfig<T>(key: string, defaultValue: T): Promise<T> {
    const config = await this.prisma.platformConfig.findUnique({
      where: { key },
    });
    
    if (!config) return defaultValue;
    
    return config.value as unknown as T;
  }

  /**
   * Calculates the dynamic shipping fee based on platform config.
   */
  async calculateShippingFee(subtotal: number): Promise<number> {
    const defaultShipping = 5000; // 50 INR in paise
    return this.getPlatformConfig<number>("BASE_SHIPPING_FEE", defaultShipping);
  }

  /**
   * Calculates dynamic tax amount based on platform config.
   */
  async calculateTaxAmount(subtotal: number): Promise<number> {
    const taxRate = await this.getPlatformConfig<number>("GLOBAL_TAX_RATE", 0.18);
    return Math.floor(subtotal * taxRate);
  }
}
