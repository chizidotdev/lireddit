import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";

import { Post } from "./entities/Post";
import { User } from "./entities/User";

import path from "path";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts}",
  },
  entities: [Post, User],
  dbName: "lireddit",
  password: "Chical1",
  type: "postgresql",
  debug: !__prod__,
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
