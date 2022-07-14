import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import conn from "../utils/app-data-source";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    if (root.text.length > 99) {
      return root.text.slice(0, 100) + "...";
    } else {
      return root.text;
    }
  }

  @FieldResolver(() => String)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;

    const { userId } = req.session;
    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // user has voted on the post before
    // and they are changing their vote
    if (updoot && updoot.value !== realValue) {
      await conn.transaction(async (tm) => {
        await tm.query(
          `
          UPDATE updoot
          SET value = $1
          WHERE "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );
        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      // has never voted before
      await conn.transaction(async (tm) => {
        await tm.query(
          `
          INSERT INTO updoot ("userId", "postId", value)
          values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );
        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
        `,
          [realValue, postId]
        );
      });
    }

    // await conn.query(
    //   `
    //     START TRANSACTION;

    //     INSERT INTO updoot ("userId", "postId", value)
    //     values (${userId}, ${postId}, ${realValue});

    //     UPDATE post
    //     SET points = points + ${realValue}
    //     WHERE id = ${postId};

    //     COMMIT;
    //   `
    // );

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    // @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit) + 1;
    const realLimitPlusOne = Math.min(50, limit) + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    // console.log("session status", req.session);
    // console.log("", req);

    const posts = await conn.query(
      `
      SELECT p.* FROM post p
      ${cursor ? `WHERE p."createdAt" < $2` : ""}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `,
      replacements
    );

    // console.log("posts: ", posts);

    // if (cursor) {
    //   posts = await conn
    //     .getRepository(Post)
    //     .createQueryBuilder("p")
    //     .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //     .where('p."createdAt" < :cursor', {
    //       cursor: new Date(parseInt(cursor)),
    //     })
    //     .orderBy('p."createdAt"', "DESC")
    //     .take(realLimitPlusOne)
    //     .getMany();
    // } else {
    //   posts = await conn
    //     .getRepository(Post)
    //     .createQueryBuilder("p")
    //     .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //     .orderBy('p."createdAt"', "DESC")
    //     .take(realLimit)
    //     .getMany();
    // }

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session!.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await conn
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
