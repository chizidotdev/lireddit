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
import { FindOneOptions } from "typeorm";
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
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit) + 1;
    const realLimitPlusOne = Math.min(50, limit) + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await conn.query(
      `
      SELECT p.*, json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator FROM post p
      INNER JOIN public.user u ON u.id = p."creatorId"
      ${cursor ? `WHERE p."createdAt"' < $2` : ""}
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
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOne(id as FindOneOptions<Post>);
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
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id as FindOneOptions<Post>);
    if (!post) {
      return null;
    }
    if (typeof title !== undefined) {
      Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
