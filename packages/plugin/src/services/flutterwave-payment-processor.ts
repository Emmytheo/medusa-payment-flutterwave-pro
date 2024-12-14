import Flutterwave, { FlutterwaveTransactionAuthorisation } from "../lib/flutterwave";

import {
  AbstractPaymentProcessor,
  PaymentProcessorContext,
  PaymentProcessorError,
  PaymentProcessorSessionResponse,
  PaymentSessionStatus,
  MedusaContainer,
  CartService,
} from "@medusajs/medusa";
import { MedusaError, MedusaErrorTypes } from "@medusajs/utils";
import { formatCurrencyCode } from "../utils/currencyCode";

export interface FlutterwavePaymentProcessorConfig
  extends Record<string, unknown> {
  /**
   * Flutterwave Secret Key
   *
   * Obtainable from the Flutterwave dashboard - Settings -> API Keys
   * https://developer.flutterwave.com/docs/integration-guides/authentication
   */
  secret_key: string;

  /**
   * Disable retries on network errors and 5xx errors on idempotent requests to Flutterwave
   * @default false
   */
  disable_retries?: boolean;

  /**
   * Debug mode
   * If true, logs helpful debug information to the console
   */
  debug?: boolean;
}

class FlutterwavePaymentProcessor extends AbstractPaymentProcessor {
  static identifier = "flutterwave";

  protected readonly cartService: CartService;
  protected readonly configuration: FlutterwavePaymentProcessorConfig;
  protected readonly flutterwave: Flutterwave;
  protected readonly debug: boolean;

  constructor(
    container: Record<string, any> & MedusaContainer,
    options: FlutterwavePaymentProcessorConfig,
  ) {
    super(container, options);

    if (!options.secret_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "The Flutterwave provider requires the secret_key option",
      );
    }

    this.configuration = options;
    this.flutterwave = new Flutterwave(this.configuration.secret_key, {
      disable_retries: options.disable_retries,
    });
    this.debug = Boolean(options.debug);

    this.cartService = container.cartService;

    if (this.cartService.retrieveWithTotals === undefined) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Your Medusa installation contains an outdated cartService implementation. Update your Medusa installation.",
      );
    }
  }

  async initiatePayment(context: PaymentProcessorContext): Promise<
    | PaymentProcessorError
    | (PaymentProcessorSessionResponse & {
        session_data: {
          flutterwaveTxRef: string;
          flutterwaveTxAuthData: FlutterwaveTransactionAuthorisation;
          cartId: string;
        };
      })
  > {
    if (this.debug) {
      console.info(
        "FW_Debug: InitiatePayment",
        JSON.stringify(context, null, 2),
      );
    }

    const { amount, email, currency_code } = context;

    const validatedCurrencyCode = formatCurrencyCode(currency_code);

    const { data, status, message } =
      await this.flutterwave.transaction.initialize({
        amount: amount,
        email,
        currency: validatedCurrencyCode,
        tx_ref: context.resource_id,
      });

    if (status === "error") {
      return this.buildError("Failed to initiate Flutterwave payment", {
        detail: message,
      });
    }

    return {
      session_data: {
        flutterwaveTxRef: data.tx_ref,
        flutterwaveTxAuthData: data,
        cartId: context.resource_id,
      },
    };
  }

  async updatePaymentData(
    _: string,
    data: Record<string, unknown>,
  ): Promise<
    PaymentProcessorSessionResponse["session_data"] | PaymentProcessorError
  > {
    if (this.debug) {
      console.info(
        "FW_Debug: UpdatePaymentData",
        JSON.stringify({ _, data }, null, 2),
      );
    }

    if (data.amount) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_DATA,
        "Cannot update amount from updatePaymentData",
      );
    }

    return {
      session_data: {
        ...data,
      },
    };
  }

  async updatePayment(context: PaymentProcessorContext): Promise<
    | PaymentProcessorError
    | (PaymentProcessorSessionResponse & {
        session_data: {
          flutterwaveTxRef: string;
        };
      })
  > {
    if (this.debug) {
      console.info(
        "FW_Debug: UpdatePayment",
        JSON.stringify(context, null, 2),
      );
    }

    return this.initiatePayment(context);
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown> & {
      flutterwaveTxRef: string;
      cartId: string;
    },
  ): Promise<
    | PaymentProcessorError
    | {
        status: PaymentSessionStatus;
        data: Record<string, unknown>;
      }
  > {
    if (this.debug) {
      console.info(
        "FW_Debug: AuthorizePayment",
        JSON.stringify(paymentSessionData, null, 2),
      );
    }

    try {
      const { flutterwaveTxRef, cartId } = paymentSessionData;

      const { data, status } = await this.flutterwave.transaction.verify({
        tx_ref: flutterwaveTxRef,
      });

      const cart = await this.cartService.retrieveWithTotals(cartId);

      if (this.debug) {
        console.info(
          "FW_Debug: AuthorizePayment: Verification",
          JSON.stringify({ status, cart, data }, null, 2),
        );
      }

      if (status === "error") {
        return {
          status: PaymentSessionStatus.ERROR,
          data: {
            ...paymentSessionData,
            flutterwaveTxId: null,
            flutterwaveTxData: data,
          },
        };
      }

      switch (data.status) {
        case "successful": {
          const amountValid =
            Math.round(cart.total) === Math.round(data.amount);
          const currencyValid =
            cart.region.currency_code === data.currency.toLowerCase();

          if (amountValid && currencyValid) {
            return {
              status: PaymentSessionStatus.AUTHORIZED,
              data: {
                flutterwaveTxId: data.id,
                flutterwaveTxData: data,
              },
            };
          }

          await this.refundPayment(
            {
              ...paymentSessionData,
              flutterwaveTxData: data,
              flutterwaveTxId: data.id,
            },
            data.amount,
          );

          return {
            status: PaymentSessionStatus.ERROR,
            data: {
              ...paymentSessionData,
              flutterwaveTxId: data.id,
              flutterwaveTxData: data,
            },
          };
        }

        case "failed":
          return {
            status: PaymentSessionStatus.ERROR,
            data: {
              ...paymentSessionData,
              flutterwaveTxId: data.id,
              flutterwaveTxData: data,
            },
          };

        default:
          return {
            status: PaymentSessionStatus.PENDING,
            data: paymentSessionData,
          };
      }
    } catch (error) {
      return this.buildError("Failed to authorize payment", error);
    }
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown> & { flutterwaveTxId: string },
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    if (this.debug) {
      console.info(
        "FW_Debug: RetrievePayment",
        JSON.stringify(paymentSessionData, null, 2),
      );
    }

    try {
      const { flutterwaveTxId } = paymentSessionData;

      const { data, status, message } = await this.flutterwave.transaction.get({
        id: flutterwaveTxId,
      });

      if (status === "error") {
        return this.buildError("Failed to retrieve payment", {
          detail: message,
        });
      }

      return {
        ...paymentSessionData,
        flutterwaveTxData: data,
      };
    } catch (error) {
      return this.buildError("Failed to retrieve payment", error);
    }
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown> & { flutterwaveTxId: number },
    refundAmount: number,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    if (this.debug) {
      console.info(
        "FW_Debug: RefundPayment",
        JSON.stringify({ paymentSessionData, refundAmount }, null, 2),
      );
    }

    try {
      const { flutterwaveTxId } = paymentSessionData;

      const { data, status, message } = await this.flutterwave.refund.create({
        id: flutterwaveTxId,
        amount: refundAmount,
      });

      if (status === "error") {
        return this.buildError("Failed to refund payment", {
          detail: message,
        });
      }

      return {
        ...paymentSessionData,
        flutterwaveTxData: data,
      };
    } catch (error) {
      return this.buildError("Failed to refund payment", error);
    }
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown> & { flutterwaveTxId?: string },
  ): Promise<PaymentSessionStatus> {
    if (this.debug) {
      console.info(
        "FW_Debug: GetPaymentStatus",
        JSON.stringify(paymentSessionData, null, 2),
      );
    }

    const { flutterwaveTxId } = paymentSessionData;

    if (!flutterwaveTxId) {
      return PaymentSessionStatus.PENDING;
    }

    try {
      const { data, status } = await this.flutterwave.transaction.get({
        id: flutterwaveTxId,
      });

      if (status === "error") {
        return PaymentSessionStatus.ERROR;
      }

      switch (data?.status) {
        case "successful":
          return PaymentSessionStatus.AUTHORIZED;
        case "failed":
          return PaymentSessionStatus.ERROR;
        default:
          return PaymentSessionStatus.PENDING;
      }
    } catch (error) {
      return PaymentSessionStatus.ERROR;
    }
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    return paymentSessionData;
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    return paymentSessionData;
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    return paymentSessionData;
  }

  protected buildError(
    message: string,
    e:
      | {
          code?: string;
          detail: string;
        }
      | Error,
  ): PaymentProcessorError {
    const errorMessage = "Flutterwave Payment error: " + message;
    const code = e instanceof Error ? e.message : e.code;
    const detail = e instanceof Error ? e.stack : e.detail;

    return {
      error: errorMessage,
      code: code ?? "",
      detail: detail ?? "",
    };
  }
}

export default FlutterwavePaymentProcessor;
