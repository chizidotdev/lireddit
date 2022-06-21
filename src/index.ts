import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";

const main = async () => {
  // Connect to Database
  const orm = await MikroORM.init(mikroOrmConfig);

  // Run Migrations
  await orm.getMigrator().up();

  const app = express();

  app.get("/", (_, res) => {
    res.send("Hello");
  });

  app.listen(4000, () => {
    console.log("Server running on port 4000");
  });

  // // Run SQL
  // const post = orm.em.create(Post, { title: "my first post" });
  // await orm.em.persistAndFlush(post);

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

main().catch((err) => {
  console.error(err);
});
