import DataLoader from "dataloader";
import conn from "./app-data-source";
import { Updoot } from "../entities/Updoot";

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await conn
        .getRepository(Updoot)
        .find({ where: keys as { postId: number; userId: number }[] });
      const updootIdsToUpdoot: Record<number, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoot[+`${updoot.userId}|${updoot.postId}`] = updoot;
      });

      return keys.map(
        (key) => updootIdsToUpdoot[+`${key.userId}|${key.postId}`]
      );
    }
  );
