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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.GET_LIST = "GET_LIST";
exports.GET_LIST_POST = "GET_LIST_POST";
exports.GET_ONE = "GET_ONE";
exports.CREATE = "CREATE";
exports.UPDATE = "UPDATE";
exports.DELETE = "DELETE";
const toPlainObject = (json) => JSON.parse(JSON.stringify(json));
/*
  Rename _id to id to match
  ra-data-simple-rest client needs
 */
const renameId = (arr) => {
    const newArr = toPlainObject(arr);
    newArr.map((arrItem) => {
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
const getList = (router, route, model, middlewares, select) => {
    router.get(route + "/", middlewares, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { sort, range, filter } = req.query;
        console.log(req.body);
        if (sort) {
            const a = JSON.parse(sort);
            sort = { [a[0]]: a[1] === "ASC" ? 1 : -1 };
        }
        let skip = 0;
        let limit = 1000;

        if (range) {
            const a = JSON.parse(range);
            skip = a[0];
            limit = a[1] - skip;
        }
        filter = filter ? JSON.parse(filter) : {};
        Object.entries(filter).map(([key, value]) => {
            switch (key) {
                case "_id":
                    break;
                case "id":
                    filter._id = filter.id;
                    delete filter.id;
                    break;
                case "q":
                    filter["$text"] = { $search: `\"${value}\"` };
                    delete filter.q;
                    break;
                default:
                    if (typeof value !== "object") {
                        if (mongoose_1.Types.ObjectId.isValid(value)) {
                            // object id
                            filter[key] = mongoose_1.Types.ObjectId(value);
                        }
                        else {
                            // string, number
                            filter[key] = new RegExp(value, "i");
                        }
                    }
                    else if (Array.isArray(value)) {
                        // array
                        filter["$or"] = value.map(val => {
                            return { [key]: val };
                        });
                        delete filter[key];
                    }
                    else {
                        // object
                    }
            }
        });
        // console.log(filter);
        const items = renameId(yield model
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select(select)
            .exec());
        const total = yield model.count(filter);
        res.set("Content-Range", `${skip}-${skip + limit}/${total}`);
        res.json(items);
    }));
};

// Const get list with POST
const getListPost = (router, route, model, middlewares, select) => {
  router.post(route + "/", middlewares, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { sort, range } = req.query;
    let { filter } = req.body;

    if (sort) {
      const a = JSON.parse(sort);
      sort = { [a[0]]: a[1] === "ASC" ? 1 : -1 };
    }
    let skip = 0;
    let limit = 1000;

    if (range) {
      const a = JSON.parse(range);
      skip = a[0];
      limit = a[1] - skip;
    }
    filter = filter ? JSON.parse(filter) : {};
    Object.entries(filter).map(([key, value]) => {
      switch (key) {
        case "_id":
          break;
        case "id":
          filter._id = filter.id;
          delete filter.id;
          break;
        case "q":
          filter["$text"] = { $search: `\"${value}\"` };
          delete filter.q;
          break;
        default:
          if (typeof value !== "object") {
            if (mongoose_1.Types.ObjectId.isValid(value)) {
              // object id
              filter[key] = mongoose_1.Types.ObjectId(value);
            }
            else {
              // string, number
              filter[key] = new RegExp(value, "i");
            }
          }
          else if (Array.isArray(value)) {
            // array
            filter["$or"] = value.map(val => {
              return { [key]: val };
            });
            delete filter[key];
          }
          else {
            // object
          }
      }
    });
    // console.log(filter);
    const items = renameId(yield model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select)
      .exec());
    const total = yield model.count(filter);
    res.set("Content-Range", `${skip}-${skip + limit}/${total}`);
    res.json(items);
  }));
};
/*
 Get a resource
 */
const getOne = (router, route, model, middlewares, select) => {
    router.get(route + "/:id", middlewares, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const item = yield model.findOne({ _id: id }).select(select);
        if (!item) {
            res.status(404).json({ error: "Not fould" });
            return;
        }
        res.json(renameId([item])[0]);
    }));
};
/*
 Create a resource
 */
const create = (router, route, model, middlewares, select) => {
    router.post(route + "/", middlewares, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const data = req.body;
        const createdItem = yield model.create(data);
        const item = yield model.findOne({ _id: createdItem._id }).select(select);
        res.status(201).json(renameId([item])[0]);
    }));
};
/*
 Update a resource
 */
const update = (router, route, model, middlewares, select) => {
    router.put(route + "/:id", middlewares, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const data = req.body;
        const item = yield model.findOne({ _id: id }).select(select);
        if (!item) {
            res.status(404).json({ error: "Not fould" });
            return;
        }
        item.set(data);
        yield item.save();
        res.json(renameId([item])[0]);
    }));
};
/*
 Delete a resource
 */
const delete_ = (router, route, model, middlewares, select) => {
    router.delete(route + "/:id", middlewares, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        yield model.deleteOne({ _id: id }).select(select);
        res.json({ id });
    }));
};
const ACTION_TO_FUNC = {
    [exports.GET_LIST]: getList,
    [exports.GET_LIST_POST]: getListPost,
    [exports.GET_ONE]: getOne,
    [exports.CREATE]: create,
    [exports.UPDATE]: update,
    [exports.DELETE]: delete_
};
/*
 Add routes to router
 */
const rest = ({ router, route = "", model, actions = Object.keys(ACTION_TO_FUNC), middlewares = [], select = "" }) => {
    actions.forEach(action => {
        ACTION_TO_FUNC[action](router, route, model, middlewares, select);
    });
    return router;
};
exports.default = rest;
