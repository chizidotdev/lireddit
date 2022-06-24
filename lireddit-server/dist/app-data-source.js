"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = void 0;
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
exports.conn = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    database: "lireddit2",
    username: "postgres",
    password: "Chical1",
    logging: true,
    synchronize: true,
    entities: [Post_1.Post, User_1.User],
});
//# sourceMappingURL=app-data-source.js.map