"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartServiceMock = void 0;
exports.CartServiceMock = {
    retrieveWithTotals: jest.fn().mockImplementation(function (cartId) {
        var amount = cartId === "cart-123" ? 2000 : 1000;
        return Promise.resolve({
            total: amount,
            region: {
                currency_code: "ngn", // Updated to align with Flutterwave's common use case
            },
        });
    }),
};
var mock = jest.fn().mockImplementation(function () { return exports.CartServiceMock; });
exports.default = mock;
