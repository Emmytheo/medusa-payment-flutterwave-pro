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
exports.FLUTTERWAVE_API_PATH = void 0;
var axios_1 = require("axios");
var axios_retry_1 = require("axios-retry");
exports.FLUTTERWAVE_API_PATH = "https://api.flutterwave.com/v3";
var Flutterwave = /** @class */ (function () {
    function Flutterwave(apiKey, options) {
        var _this = this;
        this.transaction = {
            verify: function (_a) {
                var tx_ref = _a.tx_ref;
                return _this.requestFlutterwaveAPI({
                    path: "/transactions/".concat(tx_ref, "/verify"),
                    method: "GET",
                });
            },
            get: function (_a) {
                var id = _a.id;
                return _this.requestFlutterwaveAPI({
                    path: "/transactions/".concat(id),
                    method: "GET",
                });
            },
            initialize: function (_a) {
                var amount = _a.amount, email = _a.email, currency = _a.currency, tx_ref = _a.tx_ref, metadata = _a.metadata;
                return _this.requestFlutterwaveAPI({
                    path: "/payments",
                    method: "POST",
                    body: {
                        tx_ref: tx_ref,
                        amount: amount,
                        currency: currency,
                        customer: {
                            email: email,
                        },
                        meta: metadata,
                    },
                });
            },
        };
        this.refund = {
            create: function (_a) {
                var transaction_id = _a.transaction_id, amount = _a.amount;
                return _this.requestFlutterwaveAPI({
                    path: "/refunds",
                    method: "POST",
                    body: {
                        id: transaction_id,
                        amount: amount,
                    },
                });
            },
        };
        this.apiKey = apiKey;
        this.axiosInstance = axios_1.default.create({
            baseURL: exports.FLUTTERWAVE_API_PATH,
            headers: {
                Authorization: "Bearer ".concat(this.apiKey),
                "Content-Type": "application/json",
            },
        });
        if ((options === null || options === void 0 ? void 0 : options.disable_retries) !== true) {
            (0, axios_retry_1.default)(this.axiosInstance, {
                retries: 3,
                retryCondition: axios_retry_1.default.isNetworkOrIdempotentRequestError,
                retryDelay: axios_retry_1.default.exponentialDelay,
            });
        }
    }
    Flutterwave.prototype.requestFlutterwaveAPI = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var options, res, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        options = {
                            method: request.method,
                            url: request.path,
                            params: request.query,
                            data: request.body,
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.axiosInstance(options)];
                    case 2:
                        res = _d.sent();
                        return [2 /*return*/, res.data];
                    case 3:
                        error_1 = _d.sent();
                        if (axios_1.default.isAxiosError(error_1)) {
                            throw new Error("Error from Flutterwave API with status code ".concat((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status, ": ").concat((_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message));
                        }
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Flutterwave;
}());
exports.default = Flutterwave;
