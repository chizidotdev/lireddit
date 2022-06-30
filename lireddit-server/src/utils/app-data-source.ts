import { DataSource } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";

const conn = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  database: "lireddit2",
  username: "postgres",
  password: "Chical1",
  logging: true,
  synchronize: true,
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  entities: [Post, User],
});

export default conn;
