"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpdootLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const app_data_source_1 = __importDefault(require("./app-data-source"));
const Updoot_1 = require("../entities/Updoot");
const createUpdootLoader = () => new dataloader_1.default(async (keys) => {
    const updoots = await app_data_source_1.default
        .getRepository(Updoot_1.Updoot)
        .find({ where: keys });
    const updootIdsToUpdoot = {};
    updoots.forEach((updoot) => {
        updootIdsToUpdoot[+`${updoot.userId}|${updoot.postId}`] = updoot;
    });
    return keys.map((key) => updootIdsToUpdoot[+`${key.userId}|${key.postId}`]);
});
exports.createUpdootLoader = createUpdootLoader;
//# sourceMappingURL=createUpdootLoader.js.map