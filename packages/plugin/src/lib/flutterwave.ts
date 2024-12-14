import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";

export const FLUTTERWAVE_API_PATH = "https://api.flutterwave.com/v3";

type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

type FlutterwaveResponse<T> = {
  status: string; // e.g., "success" or "error"
  message: string;
  data: T;
};

interface Request {
  path: string;
  method: HTTPMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}

export interface FlutterwaveTransactionAuthorisation {
  link: string; // Authorization URL
  tx_ref: string; // Transaction Reference
  flw_ref: string; // Flutterwave Reference
}

export interface FlutterwaveWrapperOptions {
  disable_retries?: boolean;
}

export default class Flutterwave {
  apiKey: string;

  protected readonly axiosInstance: AxiosInstance;

  constructor(apiKey: string, options?: FlutterwaveWrapperOptions) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: FLUTTERWAVE_API_PATH,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (options?.disable_retries !== true) {
      axiosRetry(this.axiosInstance, {
        retries: 3,
        retryCondition: axiosRetry.isNetworkOrIdempotentRequestError,
        retryDelay: axiosRetry.exponentialDelay,
      });
    }
  }

  protected async requestFlutterwaveAPI<T>(request: Request): Promise<T> {
    const options = {
      method: request.method,
      url: request.path,
      params: request.query,
      data: request.body,
    } satisfies AxiosRequestConfig;

    try {
      const res = await this.axiosInstance(options);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error from Flutterwave API with status code ${error.response?.status}: ${error.response?.data?.message}`,
        );
      }

      throw error;
    }
  }

  transaction = {
    verify: ({ tx_ref }: { tx_ref: string }) =>
      this.requestFlutterwaveAPI<
        FlutterwaveResponse<{
          id: number;
          status: string;
          tx_ref: string;
          flw_ref: string;
          amount: number;
          currency: string;
        }>
      >({
        path: `/transactions/${tx_ref}/verify`,
        method: "GET",
      }),
    get: ({ id }: { id: string }) =>
      this.requestFlutterwaveAPI<
        FlutterwaveResponse<{
          id: number;
          status: string;
          tx_ref: string;
        }>
      >({
        path: `/transactions/${id}`,
        method: "GET",
      }),
    initialize: ({
      amount,
      email,
      currency,
      tx_ref,
      metadata,
    }: {
      amount: number;
      email: string;
      currency?: string;
      tx_ref: string; // Unique transaction reference
      metadata?: Record<string, unknown>;
    }) =>
      this.requestFlutterwaveAPI<
        FlutterwaveResponse<{
          link: string; // Payment link
          tx_ref: string;
          flw_ref: string;
        }>
      >({
        path: "/payments",
        method: "POST",
        body: {
          tx_ref,
          amount,
          currency,
          customer: {
            email,
          },
          meta: metadata,
        },
      }),
  };

  refund = {
    create: ({
      transaction_id,
      amount,
    }: {
      transaction_id: number;
      amount: number;
    }) =>
      this.requestFlutterwaveAPI<
        FlutterwaveResponse<{
          id: number;
          status: string;
          flw_ref: string;
          amount: number;
        }>
      >({
        path: "/refunds",
        method: "POST",
        body: {
          id: transaction_id,
          amount,
        },
      }),
  };
}
