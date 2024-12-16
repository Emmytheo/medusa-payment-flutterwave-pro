"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var medusa_1 = require("@medusajs/medusa");
var flutterwave_payment_processor_1 = require("../flutterwave-payment-processor");
var cart_1 = require("../../__mocks__/cart");
var flutterwave_1 = require("../../lib/__mocks__/flutterwave");
// Helpers
function createFlutterwaveProviderService(options) {
    if (options === void 0) { options = {
        secret_key: "sk_test_123",
    }; }
    return new flutterwave_payment_processor_1.default(
    // @ts-expect-error - We don't need to mock all the methods
    {
        cartService: cart_1.CartServiceMock,
    }, options);
}
function checkForPaymentProcessorError(response) {
    // Check for error
    if ((0, medusa_1.isPaymentProcessorError)(response)) {
        throw new Error(response.detail);
    }
    // Narrow type
    return response;
}
var demoSessionContext = {
    amount: 100,
    currency_code: "NGN",
    email: "andrew@a11rew.dev",
    resource_id: "123",
    context: {},
    paymentSessionData: {},
};
beforeAll(function () {
    flutterwave_1.flutterwaveMockServer.listen();
});
afterEach(function () {
    flutterwave_1.flutterwaveMockServer.resetHandlers();
});
afterAll(function () {
    flutterwave_1.flutterwaveMockServer.close();
});
describe("Provider Service Initialization", function () {
    it("initializes the provider service", function () {
        var service = createFlutterwaveProviderService();
        expect(service).toBeTruthy();
    });
    it("fails initialization if api_key is not provided", function () {
        expect(function () {
            void createFlutterwaveProviderService({
                // @ts-expect-error - We are testing for missing secretKey, helper has default value
                secret_key: undefined,
            });
        }).toThrow();
    });
});
describe("createPayment", function () {
    it("returns a payment session with a transaction reference", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, flutterwaveTxRef, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.initiatePayment(demoSessionContext)];
                case 1:
                    flutterwaveTxRef = _a.apply(void 0, [_b.sent()]).session_data.flutterwaveTxRef;
                    expect(flutterwaveTxRef).toBeTruthy();
                    expect(flutterwaveTxRef).toEqual(expect.any(String));
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("updatePayment", function () {
    it("returns a new reference when payment is updated", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, oldRef, _a, newRef, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.initiatePayment(demoSessionContext)];
                case 1:
                    oldRef = _a.apply(void 0, [_c.sent()]).session_data.flutterwaveTxRef;
                    _b = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.updatePayment(__assign({}, demoSessionContext))];
                case 2:
                    newRef = _b.apply(void 0, [_c.sent()]).session_data.flutterwaveTxRef;
                    // The refs should be different
                    expect(oldRef).not.toEqual(newRef);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("Authorize Payment", function () {
    it("returns status error on Flutterwave tx authorization fail", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.authorizePayment({
                            flutterwaveTxRef: "123-failed",
                            cartId: "cart-123",
                        })];
                case 1:
                    payment = _a.apply(void 0, [_b.sent()]);
                    expect(payment.status).toEqual(medusa_1.PaymentSessionStatus.ERROR);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns status success on Flutterwave tx authorization pass", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.authorizePayment({
                            flutterwaveTxRef: "123-passed",
                            cartId: "cart-123",
                        })];
                case 1:
                    payment = _a.apply(void 0, [_b.sent()]);
                    expect(payment.status).toEqual(medusa_1.PaymentSessionStatus.AUTHORIZED);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns status error on Flutterwave invalid key error", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.authorizePayment({
                            flutterwaveTxRef: "123-false",
                            cartId: "cart-123",
                        })];
                case 1:
                    payment = _a.apply(void 0, [_b.sent()]);
                    expect(payment.status).toEqual(medusa_1.PaymentSessionStatus.ERROR);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns status pending on Flutterwave tx authorization pending", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.authorizePayment({
                            flutterwaveTxRef: "123-pending",
                            cartId: "cart-123",
                        })];
                case 1:
                    payment = _a.apply(void 0, [_b.sent()]);
                    expect(payment.status).toEqual(medusa_1.PaymentSessionStatus.PENDING);
                    return [2 /*return*/];
            }
        });
    }); });
    it("errors out if the returned amount differs", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.authorizePayment({
                            flutterwaveTxRef: "123-passed",
                            cartId: "cart-1000",
                        })];
                case 1:
                    payment = _a.apply(void 0, [_b.sent()]);
                    expect(payment.status).toEqual(medusa_1.PaymentSessionStatus.ERROR);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("getStatus", function () {
    it("returns pending if no flutterwaveTxId is provided", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.getPaymentStatus({})];
                case 1:
                    status = _a.sent();
                    expect(status).toEqual(medusa_1.PaymentSessionStatus.PENDING);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns authorized if Flutterwave status is success", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.getPaymentStatus({
                            flutterwaveTxId: "123-success",
                        })];
                case 1:
                    status = _a.sent();
                    expect(status).toEqual(medusa_1.PaymentSessionStatus.AUTHORIZED);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns error if Flutterwave status is failed", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.getPaymentStatus({
                            flutterwaveTxId: "123-failed",
                        })];
                case 1:
                    status = _a.sent();
                    expect(status).toEqual(medusa_1.PaymentSessionStatus.ERROR);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns error if Flutterwave status is false (invalid key error)", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.getPaymentStatus({
                            flutterwaveTxId: "123-false",
                        })];
                case 1:
                    payment = _a.sent();
                    expect(payment).toEqual(medusa_1.PaymentSessionStatus.ERROR);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("retrievePayment", function () {
    it("returns a data object", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.retrievePayment({
                            flutterwaveTxId: "123-success",
                        })];
                case 1:
                    payment = _a.sent();
                    expect(payment).toMatchObject({});
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("updatePaymentData", function () {
    it("errors out if we try to update the amount", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    service = createFlutterwaveProviderService();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, service.updatePaymentData("1", {
                            amount: 100,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    expect(error_1.message).toEqual("Cannot update amount from updatePaymentData");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it("returns the same payment data object", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, existingRef, payment, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    existingRef = "123-pending";
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.updatePaymentData("1", {
                            flutterwaveTxRef: existingRef,
                        })];
                case 1:
                    payment = _a.apply(void 0, [_c.sent()]);
                    // The ref should be the same
                    expect((_b = payment.session_data) === null || _b === void 0 ? void 0 : _b.flutterwaveTxRef).toEqual(existingRef);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("refundPayment", function () {
    it("refunds payment, returns refunded amount and transaction", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.refundPayment({
                            flutterwaveTxId: 1244,
                        }, 4000)];
                case 1:
                    payment = _a.sent();
                    expect(payment).toMatchObject({
                        flutterwaveTxId: 1244,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("capturePayment", function () {
    it("returns passed in object", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.capturePayment({
                            flutterwaveTxId: "123-capture",
                        })];
                case 1:
                    payment = _a.sent();
                    expect(payment).toMatchObject({
                        flutterwaveTxId: "123-capture",
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("cancelPayment", function () {
    it("returns passed in object", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.cancelPayment({
                            flutterwaveTxId: "123-cancel",
                        })];
                case 1:
                    payment = _a.sent();
                    expect(payment).toMatchObject({
                        flutterwaveTxId: "123-cancel",
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("deletePayment", function () {
    it("returns passed in object", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    return [4 /*yield*/, service.deletePayment({
                            flutterwaveTxId: "123-delete",
                        })];
                case 1:
                    payment = _a.sent();
                    expect(payment).toMatchObject({
                        flutterwaveTxId: "123-delete",
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("Retriable error handling", function () {
    it("retries on 5xx errors from Flutterwave", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, payment, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    service = createFlutterwaveProviderService();
                    _a = checkForPaymentProcessorError;
                    return [4 /*yield*/, service.authorizePayment({
                            flutterwaveTxRef: "123-throw",
                            cartId: "cart-123",
                        })];
                case 1:
                    payment = _a.apply(void 0, [_b.sent()]);
                    // It should return success after retrying
                    expect(payment.status).toEqual(medusa_1.PaymentSessionStatus.AUTHORIZED);
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not retry if disable_retries is true", function () { return __awaiter(void 0, void 0, void 0, function () {
        var service;
        return __generator(this, function (_a) {
            service = createFlutterwaveProviderService({
                secret_key: "sk_test_123",
                disable_retries: true,
            });
            // We receive a PaymentProcessorError
            expect(function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = checkForPaymentProcessorError;
                            return [4 /*yield*/, service.authorizePayment({
                                    flutterwaveTxRef: "123-throw",
                                    cartId: "cart-123",
                                })];
                        case 1:
                            _a.apply(void 0, [_b.sent()]);
                            return [2 /*return*/];
                    }
                });
            }); }).rejects.toThrow();
            return [2 /*return*/];
        });
    }); });
});
