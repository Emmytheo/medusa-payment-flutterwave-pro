"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var flutterwave_1 = require("../lib/flutterwave");
var medusa_1 = require("@medusajs/medusa");
var utils_1 = require("@medusajs/utils");
var currencyCode_1 = require("../utils/currencyCode");
var FlutterwavePaymentProcessor = /** @class */ (function (_super) {
    __extends(FlutterwavePaymentProcessor, _super);
    function FlutterwavePaymentProcessor(container, options) {
        var _this = _super.call(this, container, options) || this;
        if (!options.secret_key) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "The Flutterwave provider requires the secret_key option");
        }
        _this.configuration = options;
        _this.flutterwave = new flutterwave_1.default(_this.configuration.secret_key, {
            disable_retries: options.disable_retries,
        });
        _this.debug = Boolean(options.debug);
        _this.cartService = container.cartService;
        if (_this.cartService.retrieveWithTotals === undefined) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNEXPECTED_STATE, "Your Medusa installation contains an outdated cartService implementation. Update your Medusa installation.");
        }
        return _this;
    }
    FlutterwavePaymentProcessor.prototype.initiatePayment = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var amount, email, currency_code, validatedCurrencyCode, _a, data, status, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.debug) {
                            console.info("FW_Debug: InitiatePayment", JSON.stringify(context, null, 2));
                        }
                        amount = context.amount, email = context.email, currency_code = context.currency_code;
                        validatedCurrencyCode = (0, currencyCode_1.formatCurrencyCode)(currency_code);
                        return [4 /*yield*/, this.flutterwave.transaction.initialize({
                                amount: amount,
                                email: email,
                                currency: validatedCurrencyCode,
                                tx_ref: context.resource_id,
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, status = _a.status, message = _a.message;
                        if (status === "error") {
                            return [2 /*return*/, this.buildError("Failed to initiate Flutterwave payment", {
                                    detail: message,
                                })];
                        }
                        return [2 /*return*/, {
                                session_data: {
                                    flutterwaveTxRef: data.tx_ref,
                                    flutterwaveTxAuthData: data,
                                    cartId: context.resource_id,
                                },
                            }];
                }
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.updatePaymentData = function (_, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.debug) {
                    console.info("FW_Debug: UpdatePaymentData", JSON.stringify({ _: _, data: data }, null, 2));
                }
                if (data.amount) {
                    throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_DATA, "Cannot update amount from updatePaymentData");
                }
                return [2 /*return*/, {
                        session_data: __assign({}, data),
                    }];
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.updatePayment = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.debug) {
                    console.info("FW_Debug: UpdatePayment", JSON.stringify(context, null, 2));
                }
                return [2 /*return*/, this.initiatePayment(context)];
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.authorizePayment = function (paymentSessionData) {
        return __awaiter(this, void 0, void 0, function () {
            var flutterwaveTxRef, cartId, _a, data, status_1, cart, _b, amountValid, currencyValid, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.debug) {
                            console.info("FW_Debug: AuthorizePayment", JSON.stringify(paymentSessionData, null, 2));
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, , 10]);
                        flutterwaveTxRef = paymentSessionData.flutterwaveTxRef, cartId = paymentSessionData.cartId;
                        return [4 /*yield*/, this.flutterwave.transaction.verify({
                                tx_ref: flutterwaveTxRef,
                            })];
                    case 2:
                        _a = _c.sent(), data = _a.data, status_1 = _a.status;
                        return [4 /*yield*/, this.cartService.retrieveWithTotals(cartId)];
                    case 3:
                        cart = _c.sent();
                        if (this.debug) {
                            console.info("FW_Debug: AuthorizePayment: Verification", JSON.stringify({ status: status_1, cart: cart, data: data }, null, 2));
                        }
                        if (status_1 === "error") {
                            return [2 /*return*/, {
                                    status: medusa_1.PaymentSessionStatus.ERROR,
                                    data: __assign(__assign({}, paymentSessionData), { flutterwaveTxId: null, flutterwaveTxData: data }),
                                }];
                        }
                        _b = data.status;
                        switch (_b) {
                            case "successful": return [3 /*break*/, 4];
                            case "failed": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 4:
                        amountValid = Math.round(cart.total) === Math.round(data.amount);
                        currencyValid = cart.region.currency_code === data.currency.toLowerCase();
                        if (amountValid && currencyValid) {
                            return [2 /*return*/, {
                                    status: medusa_1.PaymentSessionStatus.AUTHORIZED,
                                    data: {
                                        flutterwaveTxId: data.id,
                                        flutterwaveTxData: data,
                                    },
                                }];
                        }
                        return [4 /*yield*/, this.refundPayment(__assign(__assign({}, paymentSessionData), { flutterwaveTxData: data, flutterwaveTxId: data.id }), data.amount)];
                    case 5:
                        _c.sent();
                        return [2 /*return*/, {
                                status: medusa_1.PaymentSessionStatus.ERROR,
                                data: __assign(__assign({}, paymentSessionData), { flutterwaveTxId: data.id, flutterwaveTxData: data }),
                            }];
                    case 6: return [2 /*return*/, {
                            status: medusa_1.PaymentSessionStatus.ERROR,
                            data: __assign(__assign({}, paymentSessionData), { flutterwaveTxId: data.id, flutterwaveTxData: data }),
                        }];
                    case 7: return [2 /*return*/, {
                            status: medusa_1.PaymentSessionStatus.PENDING,
                            data: paymentSessionData,
                        }];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _c.sent();
                        return [2 /*return*/, this.buildError("Failed to authorize payment", error_1)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.retrievePayment = function (paymentSessionData) {
        return __awaiter(this, void 0, void 0, function () {
            var flutterwaveTxId, _a, data, status_2, message, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.debug) {
                            console.info("FW_Debug: RetrievePayment", JSON.stringify(paymentSessionData, null, 2));
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        flutterwaveTxId = paymentSessionData.flutterwaveTxId;
                        return [4 /*yield*/, this.flutterwave.transaction.get({
                                id: flutterwaveTxId,
                            })];
                    case 2:
                        _a = _b.sent(), data = _a.data, status_2 = _a.status, message = _a.message;
                        if (status_2 === "error") {
                            return [2 /*return*/, this.buildError("Failed to retrieve payment", {
                                    detail: message,
                                })];
                        }
                        return [2 /*return*/, __assign(__assign({}, paymentSessionData), { flutterwaveTxData: data })];
                    case 3:
                        error_2 = _b.sent();
                        return [2 /*return*/, this.buildError("Failed to retrieve payment", error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.refundPayment = function (paymentSessionData, refundAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var flutterwaveTxId, _a, data, status_3, message, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.debug) {
                            console.info("FW_Debug: RefundPayment", JSON.stringify({ paymentSessionData: paymentSessionData, refundAmount: refundAmount }, null, 2));
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        flutterwaveTxId = paymentSessionData.flutterwaveTxId;
                        return [4 /*yield*/, this.flutterwave.refund.create({
                                id: flutterwaveTxId,
                                amount: refundAmount,
                            })];
                    case 2:
                        _a = _b.sent(), data = _a.data, status_3 = _a.status, message = _a.message;
                        if (status_3 === "error") {
                            return [2 /*return*/, this.buildError("Failed to refund payment", {
                                    detail: message,
                                })];
                        }
                        return [2 /*return*/, __assign(__assign({}, paymentSessionData), { flutterwaveTxData: data })];
                    case 3:
                        error_3 = _b.sent();
                        return [2 /*return*/, this.buildError("Failed to refund payment", error_3)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.getPaymentStatus = function (paymentSessionData) {
        return __awaiter(this, void 0, void 0, function () {
            var flutterwaveTxId, _a, data, status_4, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.debug) {
                            console.info("FW_Debug: GetPaymentStatus", JSON.stringify(paymentSessionData, null, 2));
                        }
                        flutterwaveTxId = paymentSessionData.flutterwaveTxId;
                        if (!flutterwaveTxId) {
                            return [2 /*return*/, medusa_1.PaymentSessionStatus.PENDING];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.flutterwave.transaction.get({
                                id: flutterwaveTxId,
                            })];
                    case 2:
                        _a = _b.sent(), data = _a.data, status_4 = _a.status;
                        if (status_4 === "error") {
                            return [2 /*return*/, medusa_1.PaymentSessionStatus.ERROR];
                        }
                        switch (data === null || data === void 0 ? void 0 : data.status) {
                            case "successful":
                                return [2 /*return*/, medusa_1.PaymentSessionStatus.AUTHORIZED];
                            case "failed":
                                return [2 /*return*/, medusa_1.PaymentSessionStatus.ERROR];
                            default:
                                return [2 /*return*/, medusa_1.PaymentSessionStatus.PENDING];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        return [2 /*return*/, medusa_1.PaymentSessionStatus.ERROR];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.capturePayment = function (paymentSessionData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, paymentSessionData];
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.cancelPayment = function (paymentSessionData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, paymentSessionData];
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.deletePayment = function (paymentSessionData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, paymentSessionData];
            });
        });
    };
    FlutterwavePaymentProcessor.prototype.buildError = function (message, e) {
        var errorMessage = "Flutterwave Payment error: " + message;
        var code = e instanceof Error ? e.message : e.code;
        var detail = e instanceof Error ? e.stack : e.detail;
        return {
            error: errorMessage,
            code: code !== null && code !== void 0 ? code : "",
            detail: detail !== null && detail !== void 0 ? detail : "",
        };
    };
    FlutterwavePaymentProcessor.identifier = "flutterwave";
    return FlutterwavePaymentProcessor;
}(medusa_1.AbstractPaymentProcessor));
exports.default = FlutterwavePaymentProcessor;
