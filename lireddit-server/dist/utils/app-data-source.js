"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Updoot_1 = require("../entities/Updoot");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
const User_1 = require("../entities/User");
const conn = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: "lireddit2",
    username: "postgres",
    password: "Chical1",
    logging: true,
    synchronize: true,
    migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
    entities: [Post_1.Post, User_1.User, Updoot_1.Updoot],
});
exports.default = conn;
//# sourceMappingURL=app-data-source.js.map