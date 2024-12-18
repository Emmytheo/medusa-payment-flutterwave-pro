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
exports.config = exports.SUPPORTED_EVENTS = void 0;
exports.default = webhookHandle;
var utils_1 = require("@medusajs/utils");
var flutterwave_payment_processor_1 = require("../services/flutterwave-payment-processor");
exports.SUPPORTED_EVENTS = ["charge.success"];
exports.config = {
    event: "flutterwave.webhook_event",
};
function webhookHandle(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var pluginConfiguration, cartId, _c;
        var data = _b.data, container = _b.container;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    pluginConfiguration = container.resolve("pp_".concat(flutterwave_payment_processor_1.default.identifier)).configuration;
                    cartId = data.data.metadata.cart_id;
                    if (!cartId) {
                        console.error("FW_Debug: No cart_id found in webhook transaction metadata");
                        return [2 /*return*/];
                    }
                    _c = data.event;
                    switch (_c) {
                        case "charge.success": return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, handleChargeSuccess(container, cartId)];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3: return [3 /*break*/, 4];
                case 4:
                    if (pluginConfiguration.debug) {
                        console.info("FW_Debug: Handled Flutterwave webhook event: ".concat(data.event, " successfully"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleChargeSuccess(container, cartId) {
    return __awaiter(this, void 0, void 0, function () {
        var orderService, order, completionStrategy, cartService, idempotencyKeyService, manager;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orderService = container.resolve("orderService");
                    return [4 /*yield*/, orderService
                            .retrieveByCartId(cartId)
                            .catch(function () { return undefined; })];
                case 1:
                    order = _a.sent();
                    if (order) {
                        // Order already placed, do nothing
                        return [2 /*return*/];
                    }
                    completionStrategy = container.resolve("cartCompletionStrategy");
                    cartService = container.resolve("cartService");
                    idempotencyKeyService = container.resolve("idempotencyKeyService");
                    manager = container.resolve("manager");
                    return [4 /*yield*/, manager.transaction(function (transactionManager) { return __awaiter(_this, void 0, void 0, function () {
                            var idempotencyKeyServiceTx, idempotencyKey, cart, _a, response_code, response_body;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        idempotencyKeyServiceTx = idempotencyKeyService.withTransaction(transactionManager);
                                        return [4 /*yield*/, idempotencyKeyServiceTx
                                                .retrieve({
                                                request_path: "/flutterwave/hooks",
                                                idempotency_key: cartId,
                                            })
                                                .catch(function () { return undefined; })];
                                    case 1:
                                        idempotencyKey = _c.sent();
                                        if (!!idempotencyKey) return [3 /*break*/, 3];
                                        return [4 /*yield*/, idempotencyKeyService
                                                .withTransaction(transactionManager)
                                                .create({
                                                request_path: "/flutterwave/hooks",
                                                idempotency_key: cartId,
                                            })];
                                    case 2:
                                        idempotencyKey = _c.sent();
                                        _c.label = 3;
                                    case 3: return [4 /*yield*/, cartService
                                            .withTransaction(transactionManager)
                                            .retrieve(cartId, { select: ["context"] })];
                                    case 4:
                                        cart = _c.sent();
                                        return [4 /*yield*/, completionStrategy
                                                .withTransaction(transactionManager)
                                                .complete(cartId, idempotencyKey, { ip: (_b = cart.context) === null || _b === void 0 ? void 0 : _b.ip })];
                                    case 5:
                                        _a = _c.sent(), response_code = _a.response_code, response_body = _a.response_body;
                                        if (response_code !== 200) {
                                            console.error("FW_Debug: Error completing cart from webhook event with id ".concat(cartId), JSON.stringify(response_body, null, 2));
                                            throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNEXPECTED_STATE, response_body["message"], response_body["code"]);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
