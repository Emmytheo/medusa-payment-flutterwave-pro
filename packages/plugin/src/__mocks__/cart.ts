export const CartServiceMock = {
    retrieveWithTotals: jest.fn().mockImplementation((cartId: string) => {
      const amount = cartId === "cart-123" ? 2000 : 1000;
  
      return Promise.resolve({
        total: amount,
        region: {
          currency_code: "ngn", // Updated to align with Flutterwave's common use case
        },
      });
    }),
  };
  
  const mock = jest.fn().mockImplementation(() => CartServiceMock);
  
  export default mock;