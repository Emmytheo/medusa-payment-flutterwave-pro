import {
    type MedusaRequest,
    MedusaResponse,
    EventBusService,
  } from "@medusajs/medusa";
  import crypto from "crypto";
  
  import FlutterwavePaymentProcessor, {
    type FlutterwavePaymentProcessorConfig,
  } from "../../../services/flutterwave-payment-processor";
  import {
    SUPPORTED_EVENTS,
    WebhookEventData,
  } from "../../../subscribers/webhooks";
  
  type WebhookEvent = {
    event: string;
    data: Record<string, any>;
  };
  
  export const POST = async (
    req: MedusaRequest<WebhookEvent>,
    res: MedusaResponse
  ) => {
    try {
      const pluginConfiguration = req.scope.resolve<
        FlutterwavePaymentProcessor & {
          configuration: FlutterwavePaymentProcessorConfig;
        }
      >(`pp_${FlutterwavePaymentProcessor.identifier}`).configuration;
  
      const secretKey = pluginConfiguration.secret_key;
  
      if (!secretKey) {
        console.error("FW_Debug: No secret key provided for Flutterwave plugin");
        return res.sendStatus(500);
      }
  
      // Validate webhook event
      const hash = crypto
        .createHmac("sha256", pluginConfiguration.secret_key)
        .update(JSON.stringify(req.body))
        .digest("hex");
  
      if (hash !== req.headers["verif-hash"]) {
        return res.status(400).send("Invalid signature");
      }
  
      // Validate event type
      if (!SUPPORTED_EVENTS.includes(req.body.event)) {
        return res.sendStatus(200);
      }
  
      if (pluginConfiguration.debug) {
        console.info(
          `FW_Debug: Received Flutterwave webhook event: ${req.body.event} with data:`,
          JSON.stringify(req.body.data, null, 2)
        );
      }
  
      const eventData = {
        event: req.body.event,
        data: req.body.data,
      } satisfies WebhookEventData;
  
      const eventBus = req.scope.resolve<EventBusService>("eventBusService");
  
      await eventBus.emit("flutterwave.webhook_event", eventData, {
        // Delayed to prevent race conditions with manual order confirmation
        delay: 5000,
      });
  
      return res.sendStatus(200);
    } catch (err) {
      console.error("FW_Debug: Error handling Flutterwave webhook event", err);
      return res.sendStatus(500);
    }
  };
  