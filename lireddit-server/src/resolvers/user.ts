import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { FindOneOptions } from "typeorm";
// import { conn } from "../utils/app-data-source";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    //This is the current user and it's okay to show their email
    if (req.session.userId === user.id) {
      return user.email;
    }
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 4) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be greater than 4 characters",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum as FindOneOptions<User>);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user does not exist",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);

    //log in user after password change
    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return false;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      86400 // 24hours
    );

    console.log(
      "===========Because mailing doesn't work, token is: =============",
      token
    );

    await sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session!.userId) {
      return null;
    }
    const user = await User.findOne({ where: { id: req.session!.userId } });

    return user;
  }

  // Register User
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    let user;
    const hashedPassword = await argon2.hash(options.password);
    try {
      user = await User.create({
        username: options.username,
        email: options.email,
        password: hashedPassword,
      }).save();

      // ====== ALTERNATIVE SOLUTION ============ //
      // const result = await conn
      //   .createQueryBuilder()
      //   .insert()
      //   .into(User)
      //   .values({
      // username: options.username,
      // email: options.email,
      // password: hashedPassword,
      //   })
      //   .returning("*")
      //   .execute();
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [{ field: "username", message: "username already exists" }],
        };
      }
    }

    // store user id session on registration
    req.session!.userId = user?.id;

    return { user };
  }

  // Login User
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    console.log(req.session);

    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "User does not exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }

    // store user id session on log in
    req.session!.userId = user.id;

    return {
      user,
    };
  }

  // Get All Users
  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find();
  }

  // Logout
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        // Clear the cookie no matter what
        res.clearCookie(COOKIE_NAME);

        if (err) {
          console.log(err);

          resolve(false);
          return;
        }

        // // Clear the cookie only if promis successful
        // res.clearCookie("qid");
        resolve(true);
      })
    );
  }
}
