import DataLoader from "dataloader";
import { User } from "../entities/User";
import { In } from "typeorm";
import conn from "./app-data-source";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await conn.getRepository(User).findBy({
      id: In(userIds as number[]),
    });
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return userIds.map((userId) => userIdToUser[userId]);
  });
