![Medusa Flutterwave Plugin](https://user-images.githubusercontent.com/46872764/197322473-fddbc659-d81e-4f19-b36c-d9f553433c8f.png)

# About

`medusa-payment-flutterwave-pro` is a [Medusa](https://medusajs.com) plugin that adds [Flutterwave](https://flutterwave.com) as a payment provider to Medusa ecommerce stores.

![GIF Demoing Paying with Flutterwave](https://user-images.githubusercontent.com/87580113/197406110-ff68bd20-60a1-4842-85c1-1a6ef46dd498.gif)

# Setup

## Prerequisites

- [Flutterwave account](https://www.flutterwave.com)
- [Flutterwave account's secret key](https://developer.flutterwave.com/docs/integration-guides/authentication)
- Medusa server

## Medusa Server

If you don’t have a Medusa server installed yet, you must follow the [quickstart guide](https://docs.medusajs.com/learn) first.

### Install the Flutterwave Plugin

In the root of your Medusa server (backend), run the following command to install the Flutterwave plugin:

```bash
yarn add medusa-payment-flutterwave
```

### Configure the Flutterwave Plugin

Next, you need to enable the plugin in your Medusa server.

In `medusa-config.ts` add the following to the `plugins` array:

```ts
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // ... other config
  },
  modules: [
    // other modules
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          // other payment providers like stripe, paypal etc
          {
            resolve: "medusa-payment-flutterwave",
            options: {
              secret_key: <FLUTTERWAVE_SECRET_KEY>,
            } satisfies import("medusa-payment-flutterwave").PluginOptions,
          },
        ],
      },
    },
  ],
});
```

The full list of configuration options you can pass to the plugin can be found in [Config](#configuration)

### Setup Webhooks

To ensure that Medusa is notified of successful payments, you need to set up webhooks in your Flutterwave dashboard. If you're installing this plugin for production use, this is a required step.

Go to your [Flutterwave dashboard](https://www.flutterwave.com/) and navigate to the "API Settings" section.

Set the Webhook URL to `<your-medusa-backend-url>/hooks/payment/flutterwave`. Eg. `https://your-medusa-backend.com/hooks/payment/flutterwave`.

## Admin Setup

This step is required for you to be able to use Flutterwave as a payment provider in your storefront.

### Add Flutterwave to Regions

Refer to [this documentation in the user guide](https://docs.medusajs.com/v1/user-guide/regions/providers/#manage-payment-providers) to learn how to add a payment provider like Flutterwave to a region.

## Storefront Setup

Follow Medusa's [Storefront Development Checkout Flow](https://docs.medusajs.com/resources/storefront-development/checkout/payment) guide using `pp_flutterwave` as the `provider_id` to add Flutterwave to your checkout flow.

### Email in `initiatePaymentSession` context

Flutterwave requires the customer's email address to create a transaction.

You **need** to pass the customer's email address in the `initiatePaymentSession` context to create a transaction.

If your storefront does not collect customer email addresses, you can provide a dummy email but be aware all transactions on your Flutterwave dashboard will be associated with that email address.

```ts
await initiatePaymentSession(cart, {
  provider_id: selectedPaymentMethod,
  context: {
    email: cart.email,
  },
});
```

### Completing the Payment Flow

`medusa-payment-flutterwave` returns a transaction reference (`flutterwaveTxRef`) and a payment link (`flutterwaveTxLink`) that you should use to complete the Flutterwave payment flow on the storefront.

Using the returned transaction reference and payment link allows the plugin to confirm the status of the transaction on your backend, and then relay that information to Medusa.

`medusa-payment-flutterwave` inserts the transaction reference (`flutterwaveTxRef`) and payment link (`flutterwaveTxLink`) into the [`PaymentSession`](https://docs.medusajs.com/advanced/backend/payment/overview/#payment-session)'s data.

You can use the transaction reference to resume the payment flow or the payment link to redirect the customer to Flutterwave's hosted payment page.

#### Using Payment Link

Extract the payment link from the payment session's data:

```ts
const { flutterwaveTxLink } = session.data;
```

Redirect the customer to the payment link to complete the payment.

```ts
// Redirect the customer to Flutterwave's hosted payment page
window.open(flutterwaveTxLink, "_self");
```

Once the payment is successful, the customer will be redirected back to the callback URL. This page can then call the Medusa [Complete Cart](https://docs.medusajs.com/resources/storefront-development/checkout/complete-cart) method to complete the checkout flow and show a success message to the customer.

### Verify Payment

Call the Medusa [Complete Cart](https://docs.medusajs.com/resources/storefront-development/checkout/complete-cart) method in the payment completion callback of your chosen flow as mentioned in [Completing the Payment Flow](#completing-the-payment-flow) above.

`medusa-payment-flutterwave` will verify the transaction with Flutterwave and mark the cart as paid for in Medusa.

Even if the "Complete Cart" method is not called for any reason, with webhooks set up correctly, the transaction will still be marked as paid for in Medusa when the user pays for it.

## Refund Payments

You can refund captured payments made with Flutterwave from the Admin dashboard.

`medusa-payment-flutterwave` handles refunding the given amount using Flutterwave and marks the order in Medusa as refunded.

Partial refunds are also supported.

# Configuration

| Name            | Type      | Default | Description                                                                                                                                                                                            |
| --------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| secret_key      | `string`  | -       | Your Flutterwave secret key. Obtainable from the Flutterwave dashboard - Settings -> API Settings.                                                                                                     |
| disable_retries | `boolean` | `false` | Disable retries on network errors and 5xx errors on idempotent requests to Flutterwave. Generally, you should not disable retries, these errors are usually temporary but it can be useful for debugging. |
| debug           | `boolean` | `false` | Enable debug mode for the plugin. If true, logs helpful debug information to the console. Logs are prefixed with "FW_Debug".                                                                         |

# Examples

The [`examples`](https://github.com/a11rew/medusa-payment-flutterwave/blob/main/examples) directory contains a simple Medusa server with the Flutterwave plugin installed and configured.

It also contains a storefront built with Next.js that uses the Flutterwave API to complete the payment flow.
