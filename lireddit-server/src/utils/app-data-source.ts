import { DataSource } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";

export const conn = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  database: "lireddit2",
  username: "postgres",
  password: "Chical1",
  logging: true,
  synchronize: false,
  entities: [Post, User],
});
