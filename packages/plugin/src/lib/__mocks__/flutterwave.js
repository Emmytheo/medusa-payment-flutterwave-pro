"use strict";
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
exports.flutterwaveMockServer = void 0;
var msw_1 = require("msw");
var node_1 = require("msw/node");
var FLUTTERWAVE_API_PATH = "https://api.flutterwave.com/v3";
var handlers = [
    // Transaction verification
    msw_1.http.get("".concat(FLUTTERWAVE_API_PATH, "/transactions/:transaction_id/verify"), function (req) {
        var transaction_id = req.params.transaction_id;
        var testRetryCount = req.cookies.testRetryCount;
        var retryCount = testRetryCount ? parseInt(testRetryCount) : 0;
        switch (transaction_id) {
            case "123-failed":
                return msw_1.HttpResponse.json({
                    status: "error",
                    message: "Verification failed",
                    data: {
                        status: "failed",
                        id: "123",
                    },
                });
            case "123-passed":
                return msw_1.HttpResponse.json({
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
                    return msw_1.HttpResponse.json({
                        status: "error",
                        message: "Flutterwave error",
                    }, {
                        status: 500,
                        headers: {
                            "Set-Cookie": "testRetryCount=".concat(retryCount + 1),
                        },
                    });
                }
                // Respond with success on the 4th attempt
                return msw_1.HttpResponse.json({
                    status: "success",
                    message: "Verification successful",
                    data: {
                        status: "successful",
                        id: "123",
                        amount: 2000,
                        currency: "GHS",
                    },
                }, {
                    headers: {
                        "Set-Cookie": "testRetryCount=0",
                    },
                });
            }
            default:
                return msw_1.HttpResponse.json({
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
    msw_1.http.post("".concat(FLUTTERWAVE_API_PATH, "/payments"), function (req) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, amount, currency, email;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, req.request.json()];
                case 1:
                    _a = (_b.sent()), amount = _a.amount, currency = _a.currency, email = _a.email;
                    if (typeof amount !== "number" || !email || !currency) {
                        return [2 /*return*/, msw_1.HttpResponse.json({
                                status: "error",
                                message: "Invalid input",
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, msw_1.HttpResponse.json({
                            status: "success",
                            message: "Transaction initialized",
                            data: {
                                reference: "ref-".concat(Math.random() * 1000),
                                link: "https://flutterwave.com/pay/123",
                            },
                        })];
            }
        });
    }); }),
    // Get transaction
    msw_1.http.get("".concat(FLUTTERWAVE_API_PATH, "/transactions/:id"), function (req) {
        var id = req.params.id;
        switch (id) {
            case "123-success":
                return msw_1.HttpResponse.json({
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
                return msw_1.HttpResponse.json({
                    status: "error",
                    message: "Transaction failure",
                    data: {
                        status: "failed",
                        id: "123",
                    },
                });
            default:
                return msw_1.HttpResponse.json({
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
    msw_1.http.post("".concat(FLUTTERWAVE_API_PATH, "/transactions/:transaction_id/refund"), function (req) { return __awaiter(void 0, void 0, void 0, function () {
        var transaction_id, amount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transaction_id = req.params.transaction_id;
                    return [4 /*yield*/, req.request.json()];
                case 1:
                    amount = (_a.sent()).amount;
                    if (!transaction_id || typeof amount !== "number") {
                        return [2 /*return*/, msw_1.HttpResponse.json({
                                status: "error",
                                message: "Invalid refund request",
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, msw_1.HttpResponse.json({
                            status: "success",
                            message: "Refund created",
                            data: {
                                id: Math.floor(Math.random() * 10000),
                                status: "successful",
                                transaction_id: transaction_id,
                                amount: amount,
                            },
                        })];
            }
        });
    }); }),
];
exports.flutterwaveMockServer = node_1.setupServer.apply(void 0, handlers);
