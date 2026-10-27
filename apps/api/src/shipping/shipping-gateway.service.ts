/**
 * Shiprocket Shipping Gateway Interface
 * 
 * Structure is complete — swap the mock implementations with real
 * Shiprocket API calls when you're ready to go live.
 * 
 * Required env vars:
 *   SHIPROCKET_EMAIL
 *   SHIPROCKET_PASSWORD
 *   SHIPROCKET_API_URL (default: https://apiv2.shiprocket.in/v1/external)
 */

import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface CreateShipmentInput {
  orderId: string;
  sellerOrderId: string;
  pickupAddress: ShippingAddress;
  deliveryAddress: ShippingAddress;
  items: ShipmentItem[];
  weight: number; // in kg
  dimensions?: { length: number; width: number; height: number }; // in cm
  paymentMode: "prepaid" | "cod";
  subtotal: number; // in paise
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface ShipmentItem {
  name: string;
  sku: string;
  quantity: number;
  price: number; // in paise
}

export interface ShipmentResult {
  shipmentId: string;
  courierName: string;
  trackingNumber: string;
  estimatedDelivery: string;
  label?: string; // URL to shipping label PDF
}

export interface TrackingResult {
  shipmentId: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface ServiceabilityResult {
  available: boolean;
  estimatedDays: number;
  courierName: string;
  rate: number; // in paise
}

@Injectable()
export class ShippingGatewayService {
  private readonly logger = new Logger(ShippingGatewayService.name);
  private readonly isLive: boolean;
  private authToken: string | null = null;

  constructor(private config: ConfigService) {
    this.isLive = !!(this.config.get("SHIPROCKET_EMAIL") && this.config.get("SHIPROCKET_PASSWORD"));
    if (!this.isLive) {
      this.logger.warn("⚠️ Shiprocket credentials not configured — running in MOCK shipping mode");
    }
  }

  /** Check if delivery is available for a pincode */
  async checkServiceability(pickupPincode: string, deliveryPincode: string, weight: number): Promise<ServiceabilityResult> {
    if (!this.isLive) {
      return {
        available: true,
        estimatedDays: 5,
        courierName: "Mock Courier",
        rate: 15000, // ₹150
      };
    }

    // TODO: Replace with real Shiprocket API call
    // await this.ensureAuth();
    // const res = await fetch(`${this.apiUrl}/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}`, { headers: this.authHeaders });
    // const data = await res.json();
    throw new BadRequestException("Shiprocket serviceability check pending");
  }

  /** Create a shipment and get tracking number */
  async createShipment(input: CreateShipmentInput): Promise<ShipmentResult> {
    if (!this.isLive) {
      return {
        shipmentId: `mock_ship_${Date.now()}`,
        courierName: "Mock Courier",
        trackingNumber: `MOCK${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    // TODO: Replace with real Shiprocket API call
    // await this.ensureAuth();
    // const order = await this.createShiprocketOrder(input);
    // const shipment = await this.assignCourier(order.order_id);
    // return { shipmentId: shipment.shipment_id, courierName: shipment.courier_name, trackingNumber: shipment.awb_code, ... };
    throw new BadRequestException("Shiprocket shipment creation pending");
  }

  /** Track a shipment by tracking number */
  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    if (!this.isLive) {
      return {
        shipmentId: "mock_123",
        status: "IN_TRANSIT",
        currentLocation: "Mumbai Hub",
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          { timestamp: new Date().toISOString(), status: "IN_TRANSIT", location: "Mumbai Hub", description: "Package in transit" },
          { timestamp: new Date(Date.now() - 86400000).toISOString(), status: "PICKED_UP", location: "Seller Warehouse", description: "Package picked up" },
        ],
      };
    }

    // TODO: Replace with real Shiprocket API call
    // await this.ensureAuth();
    // const res = await fetch(`${this.apiUrl}/courier/track/awb/${trackingNumber}`, { headers: this.authHeaders });
    throw new BadRequestException("Shiprocket tracking pending");
  }

  /** Cancel a shipment */
  async cancelShipment(shipmentId: string): Promise<boolean> {
    if (!this.isLive) {
      return true;
    }

    // TODO: Replace with real Shiprocket API call
    throw new BadRequestException("Shiprocket cancellation pending");
  }

  /** Generate return shipment */
  async createReturnShipment(originalShipmentId: string, reason: string): Promise<ShipmentResult> {
    if (!this.isLive) {
      return {
        shipmentId: `mock_return_${Date.now()}`,
        courierName: "Mock Courier",
        trackingNumber: `MOCKRET${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    throw new BadRequestException("Shiprocket return shipment pending");
  }

  get isConfigured(): boolean {
    return this.isLive;
  }

  private get apiUrl(): string {
    return this.config.get("SHIPROCKET_API_URL") || "https://apiv2.shiprocket.in/v1/external";
  }
}
