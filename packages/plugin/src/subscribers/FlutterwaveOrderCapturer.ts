import { EventBusService, OrderService, CartService } from "@medusajs/medusa";
import { FlutterwavePaymentProcessorConfig } from "../services/flutterwave-payment-processor";

type InjectedDependencies = {
  eventBusService: EventBusService;
  orderService: OrderService;
  cartService: CartService;
};

type OrderPlacedData = {
  id: string;
};

function isOrderPlacedData(data: unknown): data is OrderPlacedData {
  return typeof data === "object" && data !== null && "id" in data;
}

class FlutterwaveOrderCapturer {
  eventBusService: EventBusService;
  orderService: OrderService;

  protected readonly debug: boolean;

  constructor(
    container: InjectedDependencies,
    options: FlutterwavePaymentProcessorConfig,
  ) {
    this.eventBusService = container.eventBusService;
    this.orderService = container.orderService;
    this.debug = options.debug || false;

    this.eventBusService.subscribe("order.placed", this.handleOrder);
  }

  handleOrder = async (data: unknown) => {
    try {
      if (!isOrderPlacedData(data)) {
        return;
      }

      const order = await this.orderService.retrieve(data.id, {
        relations: ["payments"],
      });
      if (!order) return;

      // Check if the order was paid for with Flutterwave
      const isPaidForWithFlutterwave = order.payments?.some(
        p => p.provider_id === "flutterwave",
      );
      if (!isPaidForWithFlutterwave) return;

      if (this.debug) {
        console.info(
          "FW_Debug: Capturing Flutterwave order with data:",
          JSON.stringify(data, null, 2),
        );
      }

      // Capture the payment
      await this.orderService.capturePayment(order.id);
    } catch (error) {
      console.error("Error capturing Flutterwave order:", error);
    }
  };
}

export default FlutterwaveOrderCapturer;
