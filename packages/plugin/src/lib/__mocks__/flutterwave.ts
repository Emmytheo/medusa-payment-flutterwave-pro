import { http, HttpResponse, HttpResponseInit } from "msw";
import { setupServer } from "msw/node";

const FLUTTERWAVE_API_PATH = "https://api.flutterwave.com/v3";

const handlers = [
  // Transaction verification
  http.get(`${FLUTTERWAVE_API_PATH}/transactions/:transaction_id/verify`, req => {
    const { transaction_id } = req.params;
    const { testRetryCount } = req.cookies;

    const retryCount = testRetryCount ? parseInt(testRetryCount) : 0;

    switch (transaction_id) {
      case "123-failed":
        return HttpResponse.json({
          status: "error",
          message: "Verification failed",
          data: {
            status: "failed",
            id: "123",
          },
        });

      case "123-passed":
        return HttpResponse.json({
          status: "success",
          message: "Verification successful",
          data: {
            status: "successful",
            id: "123",
            amount: 2000,
            currency: "GHS",
          },
        });

      case "123-throw": {
        // Respond with an error for the first 3 requests
        if (retryCount <= 2) {
          return HttpResponse.json(
            {
              status: "error",
              message: "Flutterwave error",
            },
            {
              status: 500,
              headers: {
                "Set-Cookie": `testRetryCount=${retryCount + 1}`,
              },
            } as HttpResponseInit,
          );
        }

        // Respond with success on the 4th attempt
        return HttpResponse.json(
          {
            status: "success",
            message: "Verification successful",
            data: {
              status: "successful",
              id: "123",
              amount: 2000,
              currency: "GHS",
            },
          },
          {
            headers: {
              "Set-Cookie": "testRetryCount=0",
            },
          } as HttpResponseInit,
        );
      }

      default:
        return HttpResponse.json({
          status: "pending",
          message: "Verification status pending",
          data: {
            status: "pending",
            id: "123",
          },
        });
    }
  }),

  // Initialize transaction
  http.post(`${FLUTTERWAVE_API_PATH}/payments`, async req => {
    const { amount, currency, email } = (await req.request.json()) as {
      amount: number;
      currency: string;
      email: string;
    };

    if (typeof amount !== "number" || !email || !currency) {
      return HttpResponse.json(
        {
          status: "error",
          message: "Invalid input",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      status: "success",
      message: "Transaction initialized",
      data: {
        reference: `ref-${Math.random() * 1000}`,
        link: "https://flutterwave.com/pay/123",
      },
    });
  }),

  // Get transaction
  http.get(`${FLUTTERWAVE_API_PATH}/transactions/:id`, req => {
    const { id } = req.params;

    switch (id) {
      case "123-success":
        return HttpResponse.json({
          status: "success",
          message: "Transaction successful",
          data: {
            status: "successful",
            id: "123",
            amount: 1000,
            currency: "NGN",
          },
        });
      case "123-false":
        return HttpResponse.json({
          status: "error",
          message: "Transaction failure",
          data: {
            status: "failed",
            id: "123",
          },
        });
      default:
        return HttpResponse.json({
          status: "error",
          message: "Transaction not found",
          data: {
            status: "failed",
            id: id,
          },
        });
    }
  }),

  // Create refund
  http.post(`${FLUTTERWAVE_API_PATH}/transactions/:transaction_id/refund`, async req => {
    const { transaction_id } = req.params;
    const { amount } = (await req.request.json()) as {
      amount: number;
    };

    if (!transaction_id || typeof amount !== "number") {
      return HttpResponse.json(
        {
          status: "error",
          message: "Invalid refund request",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      status: "success",
      message: "Refund created",
      data: {
        id: Math.floor(Math.random() * 10000),
        status: "successful",
        transaction_id,
        amount,
      },
    });
  }),
];

export const flutterwaveMockServer = setupServer(...handlers);
