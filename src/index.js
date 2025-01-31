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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.UPDATE = exports.CREATE = exports.GET_ONE = exports.GET_LIST_POST = exports.GET_LIST = void 0;
var mongoose_1 = require("mongoose");
exports.GET_LIST = "GET_LIST";
exports.GET_LIST_POST = "GET_LIST_POST";
exports.GET_ONE = "GET_ONE";
exports.CREATE = "CREATE";
exports.UPDATE = "UPDATE";
exports.DELETE = "DELETE";
var toPlainObject = function (json) { return JSON.parse(JSON.stringify(json)); };
/*
  Rename _id to id to match
  ra-data-simple-rest client needs
 */
var renameId = function (arr) {
    var newArr = toPlainObject(arr);
    newArr.map(function (arrItem) {
        if ("_id" in arrItem) {
            arrItem.id = arrItem._id;
            delete arrItem._id;
        }
    });
    return newArr;
};
/*
 Get list of resources
 */
var getList = function (router, route, model, middlewares, select, populate) {
    router.get(route + "/", middlewares, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, sort, range, filter, a, skip, limit, a, items, _b, total;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = req.query, sort = _a.sort, range = _a.range, filter = _a.filter;
                    if (sort) {
                        a = JSON.parse(sort);
                        // @ts-ignore
                        sort = (_c = {}, _c[a[0]] = a[1] === "ASC" ? 1 : -1, _c);
                    }
                    skip = 0;
                    limit = 1000;
                    if (range) {
                        a = JSON.parse(range);
                        skip = a[0];
                        limit = a[1] - skip;
                    }
                    // @ts-ignore
                    filter = filter ? JSON.parse(filter) : {};
                    Object.entries(filter).map(function (_a) {
                        var key = _a[0], value = _a[1];
                        switch (key) {
                            case "_id":
                            case "status":
                                break;
                            case "id":
                                // @ts-ignore
                                filter._id = filter.id;
                                // @ts-ignore
                                delete filter.id;
                                break;
                            case "q":
                                filter["$text"] = { $search: "\"".concat(value, "\"") };
                                // @ts-ignore
                                delete filter.q;
                                break;
                            default:
                                if (typeof value !== "object") {
                                    if (mongoose_1.Types.ObjectId.isValid(value)) {
                                        // object id
                                        filter[key] = value;
                                    }
                                    else {
                                        // string, number
                                        filter[key] = new RegExp(value, "i");
                                    }
                                }
                                else if (Array.isArray(value)) {
                                    // array
                                    filter["$or"] = value.map(function (val) {
                                        var _a;
                                        return _a = {}, _a[key] = val, _a;
                                    });
                                    delete filter[key];
                                }
                                else {
                                    // object
                                }
                        }
                    });
                    _b = renameId;
                    // @ts-ignore
                    return [4 /*yield*/, model
                            // @ts-ignore
                            .find(filter)
                            // @ts-ignore
                            .sort(sort)
                            // @ts-ignore
                            .skip(skip)
                            // @ts-ignore
                            .limit(limit)
                            // @ts-ignore
                            .select(select)
                            // @ts-ignore
                            .populate(populate)
                            .lean()
                            .exec()];
                case 1:
                    items = _b.apply(void 0, [
                        // @ts-ignore
                        _d.sent()]);
                    return [4 /*yield*/, model.countDocuments(filter)];
                case 2:
                    total = _d.sent();
                    res.set("Content-Range", "".concat(skip, "-").concat(skip + limit, "/").concat(total));
                    res.json(items);
                    return [2 /*return*/];
            }
        });
    }); });
};
/*
Get list of resources with method POST
*/
var getListPost = function (router, route, model, middlewares, select) {
    router.post(route + "/", middlewares, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, sort, range, filter, a, skip, limit, a, items, _b, total;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = req.query, sort = _a.sort, range = _a.range;
                    filter = req.body.filter;
                    if (sort) {
                        a = JSON.parse(sort);
                        // @ts-ignore
                        sort = (_c = {}, _c[a[0]] = a[1] === "ASC" ? 1 : -1, _c);
                    }
                    skip = 0;
                    limit = 1000;
                    if (range) {
                        a = JSON.parse(range);
                        skip = a[0];
                        limit = a[1] - skip;
                    }
                    filter = filter ? JSON.parse(filter) : {};
                    Object.entries(filter).map(function (_a) {
                        var key = _a[0], value = _a[1];
                        switch (key) {
                            case "_id":
                                break;
                            case "id":
                                filter._id = filter.id;
                                delete filter.id;
                                break;
                            case "q":
                                filter["$text"] = { $search: "\"".concat(value, "\"") };
                                delete filter.q;
                                break;
                            default:
                                if (typeof value !== "object") {
                                    if (mongoose_1.Types.ObjectId.isValid(value)) {
                                        // object id
                                        filter[key] = value;
                                    }
                                    else {
                                        // string, number
                                        filter[key] = new RegExp(value, "i");
                                    }
                                }
                                else if (Array.isArray(value)) {
                                    // array
                                    filter["$or"] = value.map(function (val) {
                                        var _a;
                                        return _a = {}, _a[key] = val, _a;
                                    });
                                    delete filter[key];
                                }
                                else {
                                    // object
                                }
                        }
                    });
                    _b = renameId;
                    // @ts-ignore
                    return [4 /*yield*/, model
                            // @ts-ignore
                            .find(filter)
                            // @ts-ignore
                            .sort(sort)
                            // @ts-ignore
                            .skip(skip)
                            // @ts-ignore
                            .limit(limit)
                            // @ts-ignore
                            .select(select)
                            .lean()
                            .exec()];
                case 1:
                    items = _b.apply(void 0, [
                        // @ts-ignore
                        _d.sent()]);
                    return [4 /*yield*/, model.countDocuments(filter)];
                case 2:
                    total = _d.sent();
                    res.set("Content-Range", "".concat(skip, "-").concat(skip + limit, "/").concat(total));
                    res.json(items);
                    return [2 /*return*/];
            }
        });
    }); });
};
/*
 Get a resource
 */
var getOne = function (router, route, model, middlewares, select) {
    router.get(route + "/:id", middlewares, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var id, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    return [4 /*yield*/, model.findOne({ _id: id }).select(select)];
                case 1:
                    item = _a.sent();
                    if (!item) {
                        res.status(404).json({ error: "Not fould" });
                        return [2 /*return*/];
                    }
                    res.json(renameId([item])[0]);
                    return [2 /*return*/];
            }
        });
    }); });
};
/*
 Create a resource
 */
var create = function (router, route, model, middlewares, select) {
    router.post(route + "/", middlewares, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var data, createdItem, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = req.body;
                    return [4 /*yield*/, model.create(data)];
                case 1:
                    createdItem = _a.sent();
                    return [4 /*yield*/, model.findOne({ _id: createdItem._id }).select(select)];
                case 2:
                    item = _a.sent();
                    res.status(201).json(renameId([item])[0]);
                    return [2 /*return*/];
            }
        });
    }); });
};
/*
 Update a resource
 */
var update = function (router, route, model, middlewares, select) {
    router.put(route + "/:id", middlewares, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var id, data, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    data = req.body;
                    return [4 /*yield*/, model.findOne({ _id: id }).select(select)];
                case 1:
                    item = _a.sent();
                    if (!item) {
                        res.status(404).json({ error: "Not fould" });
                        return [2 /*return*/];
                    }
                    item.set(data);
                    return [4 /*yield*/, item.save()];
                case 2:
                    _a.sent();
                    res.json(renameId([item])[0]);
                    return [2 /*return*/];
            }
        });
    }); });
};
/*
 Delete a resource
 */
var delete_ = function (router, route, model, middlewares, select) {
    router.delete(route + "/:id", middlewares, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    // @ts-ignore
                    return [4 /*yield*/, model.deleteOne({ _id: id }).select(select)];
                case 1:
                    // @ts-ignore
                    _a.sent();
                    res.json({ id: id });
                    return [2 /*return*/];
            }
        });
    }); });
};
var ACTION_TO_FUNC = (_a = {},
    _a[exports.GET_LIST] = getList,
    _a[exports.GET_LIST_POST] = getListPost,
    _a[exports.GET_ONE] = getOne,
    _a[exports.CREATE] = create,
    _a[exports.UPDATE] = update,
    _a[exports.DELETE] = delete_,
    _a);
/*
 Add routes to router
 */
var rest = function (_a) {
    var router = _a.router, _b = _a.route, route = _b === void 0 ? "" : _b, model = _a.model, _c = _a.actions, actions = _c === void 0 ? Object.keys(ACTION_TO_FUNC) : _c, _d = _a.middlewares, middlewares = _d === void 0 ? [] : _d, _e = _a.select, select = _e === void 0 ? "" : _e, _f = _a.populate, populate = _f === void 0 ? "" : _f;
    actions.forEach(function (action) {
        ACTION_TO_FUNC[action](router, route, model, middlewares, select, populate);
    });
    return router;
};
exports.default = rest;
