import {
    PaymentProcessorContext,
    PaymentProcessorError,
    PaymentSessionStatus,
    isPaymentProcessorError,
  } from "@medusajs/medusa";
  
  import FlutterwavePaymentProcessor, {
    FlutterwavePaymentProcessorConfig,
  } from "../flutterwave-payment-processor";
  import { CartServiceMock } from "../../__mocks__/cart";
  import { flutterwaveMockServer } from "../../lib/__mocks__/flutterwave";
  
  // Helpers
  function createFlutterwaveProviderService(
    options: FlutterwavePaymentProcessorConfig = {
      secret_key: "sk_test_123",
    },
  ) {
    return new FlutterwavePaymentProcessor(
      // @ts-expect-error - We don't need to mock all the methods
      {
        cartService: CartServiceMock,
      },
      options,
    );
  }
  
  function checkForPaymentProcessorError<T>(response: T | PaymentProcessorError) {
    // Check for error
    if (isPaymentProcessorError(response)) {
      throw new Error(response.detail);
    }
  
    // Narrow type
    return response as T;
  }
  
  const demoSessionContext = {
    amount: 100,
    currency_code: "NGN",
    email: "andrew@a11rew.dev",
    resource_id: "123",
    context: {},
    paymentSessionData: {},
  } satisfies PaymentProcessorContext;
  
  beforeAll(() => {
    flutterwaveMockServer.listen();
  });
  
  afterEach(() => {
    flutterwaveMockServer.resetHandlers();
  });
  
  afterAll(() => {
    flutterwaveMockServer.close();
  });
  
  describe("Provider Service Initialization", () => {
    it("initializes the provider service", () => {
      const service = createFlutterwaveProviderService();
      expect(service).toBeTruthy();
    });
  
    it("fails initialization if api_key is not provided", () => {
      expect(() => {
        void createFlutterwaveProviderService({
          // @ts-expect-error - We are testing for missing secretKey, helper has default value
          secret_key: undefined,
        });
      }).toThrow();
    });
  });
  
  describe("createPayment", () => {
    it("returns a payment session with a transaction reference", async () => {
      const service = createFlutterwaveProviderService();
      const {
        session_data: { flutterwaveTxRef },
      } = checkForPaymentProcessorError(
        await service.initiatePayment(demoSessionContext),
      );
  
      expect(flutterwaveTxRef).toBeTruthy();
      expect(flutterwaveTxRef).toEqual(expect.any(String));
    });
  });
  
  describe("updatePayment", () => {
    it("returns a new reference when payment is updated", async () => {
      const service = createFlutterwaveProviderService();
      const {
        session_data: { flutterwaveTxRef: oldRef },
      } = checkForPaymentProcessorError(
        await service.initiatePayment(demoSessionContext),
      );
  
      const {
        session_data: { flutterwaveTxRef: newRef },
      } = checkForPaymentProcessorError(
        await service.updatePayment({
          ...demoSessionContext,
        }),
      );
  
      // The refs should be different
      expect(oldRef).not.toEqual(newRef);
    });
  });
  
  describe("Authorize Payment", () => {
    it("returns status error on Flutterwave tx authorization fail", async () => {
      const service = createFlutterwaveProviderService();
      const payment = checkForPaymentProcessorError(
        await service.authorizePayment({
          flutterwaveTxRef: "123-failed",
          cartId: "cart-123",
        }),
      );
      expect(payment.status).toEqual(PaymentSessionStatus.ERROR);
    });
  
    it("returns status success on Flutterwave tx authorization pass", async () => {
      const service = createFlutterwaveProviderService();
  
      const payment = checkForPaymentProcessorError(
        await service.authorizePayment({
          flutterwaveTxRef: "123-passed",
          cartId: "cart-123",
        }),
      );
  
      expect(payment.status).toEqual(PaymentSessionStatus.AUTHORIZED);
    });
  
    it("returns status error on Flutterwave invalid key error", async () => {
      const service = createFlutterwaveProviderService();
      const payment = checkForPaymentProcessorError(
        await service.authorizePayment({
          flutterwaveTxRef: "123-false",
          cartId: "cart-123",
        }),
      );
  
      expect(payment.status).toEqual(PaymentSessionStatus.ERROR);
    });
  
    it("returns status pending on Flutterwave tx authorization pending", async () => {
      const service = createFlutterwaveProviderService();
      const payment = checkForPaymentProcessorError(
        await service.authorizePayment({
          flutterwaveTxRef: "123-pending",
          cartId: "cart-123",
        }),
      );
  
      expect(payment.status).toEqual(PaymentSessionStatus.PENDING);
    });
  
    it("errors out if the returned amount differs", async () => {
      const service = createFlutterwaveProviderService();
      const payment = checkForPaymentProcessorError(
        await service.authorizePayment({
          flutterwaveTxRef: "123-passed",
          cartId: "cart-1000",
        }),
      );
  
      expect(payment.status).toEqual(PaymentSessionStatus.ERROR);
    });
  });
  
  describe("getStatus", () => {
    it("returns pending if no flutterwaveTxId is provided", async () => {
      const service = createFlutterwaveProviderService();
      const status = await service.getPaymentStatus({});
  
      expect(status).toEqual(PaymentSessionStatus.PENDING);
    });
  
    it("returns authorized if Flutterwave status is success", async () => {
      const service = createFlutterwaveProviderService();
      const status = await service.getPaymentStatus({
        flutterwaveTxId: "123-success",
      });
  
      expect(status).toEqual(PaymentSessionStatus.AUTHORIZED);
    });
  
    it("returns error if Flutterwave status is failed", async () => {
      const service = createFlutterwaveProviderService();
      const status = await service.getPaymentStatus({
        flutterwaveTxId: "123-failed",
      });
  
      expect(status).toEqual(PaymentSessionStatus.ERROR);
    });
  
    it("returns error if Flutterwave status is false (invalid key error)", async () => {
      const service = createFlutterwaveProviderService();
      const payment = await service.getPaymentStatus({
        flutterwaveTxId: "123-false",
      });
  
      expect(payment).toEqual(PaymentSessionStatus.ERROR);
    });
  });
  
  describe("retrievePayment", () => {
    it("returns a data object", async () => {
      const service = createFlutterwaveProviderService();
      const payment = await service.retrievePayment({
        flutterwaveTxId: "123-success",
      });
  
      expect(payment).toMatchObject({});
    });
  });
  
  describe("updatePaymentData", () => {
    it("errors out if we try to update the amount", async () => {
      expect.assertions(1);
      const service = createFlutterwaveProviderService();
  
      try {
        await service.updatePaymentData("1", {
          amount: 100,
        });
      } catch (error) {
        expect(error.message).toEqual(
          "Cannot update amount from updatePaymentData",
        );
      }
    });
  
    it("returns the same payment data object", async () => {
      const service = createFlutterwaveProviderService();
      const existingRef = "123-pending";
      const payment = checkForPaymentProcessorError(
        await service.updatePaymentData("1", {
          flutterwaveTxRef: existingRef,
        }),
      );
  
      // The ref should be the same
      expect(
        (
          payment.session_data as {
            flutterwaveTxRef: string;
          }
        )?.flutterwaveTxRef,
      ).toEqual(existingRef);
    });
  });
  
  describe("refundPayment", () => {
    it("refunds payment, returns refunded amount and transaction", async () => {
      const service = createFlutterwaveProviderService();
      const payment = await service.refundPayment(
        {
          flutterwaveTxId: 1244,
        },
        4000,
      );
  
      expect(payment).toMatchObject({
        flutterwaveTxId: 1244,
      });
    });
  });
  
  describe("capturePayment", () => {
    it("returns passed in object", async () => {
      const service = createFlutterwaveProviderService();
  
      const payment = await service.capturePayment({
        flutterwaveTxId: "123-capture",
      });
  
      expect(payment).toMatchObject({
        flutterwaveTxId: "123-capture",
      });
    });
  });
  
  describe("cancelPayment", () => {
    it("returns passed in object", async () => {
      const service = createFlutterwaveProviderService();
  
      const payment = await service.cancelPayment({
        flutterwaveTxId: "123-cancel",
      });
  
      expect(payment).toMatchObject({
        flutterwaveTxId: "123-cancel",
      });
    });
  });
  
  describe("deletePayment", () => {
    it("returns passed in object", async () => {
      const service = createFlutterwaveProviderService();
  
      const payment = await service.deletePayment({
        flutterwaveTxId: "123-delete",
      });
  
      expect(payment).toMatchObject({
        flutterwaveTxId: "123-delete",
      });
    });
  });
  
  describe("Retriable error handling", () => {
    it("retries on 5xx errors from Flutterwave", async () => {
      const service = createFlutterwaveProviderService();
      const payment = checkForPaymentProcessorError(
        await service.authorizePayment({
          flutterwaveTxRef: "123-throw",
          cartId: "cart-123",
        }),
      );
  
      // It should return success after retrying
      expect(payment.status).toEqual(PaymentSessionStatus.AUTHORIZED);
    });
  
    it("does not retry if disable_retries is true", async () => {
      const service = createFlutterwaveProviderService({
        secret_key: "sk_test_123",
        disable_retries: true,
      });
  
      // We receive a PaymentProcessorError
      expect(async () => {
        checkForPaymentProcessorError(
          await service.authorizePayment({
            flutterwaveTxRef: "123-throw",
            cartId: "cart-123",
          }),
        );
      }).rejects.toThrow();
    });
  });
  