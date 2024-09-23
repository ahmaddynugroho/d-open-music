import { ReqRefDefaults, ServerRoute } from "@hapi/hapi";

const post: ServerRoute<ReqRefDefaults> = {
  method: "POST",
  path: "/albums",
  handler: (_, h) => {
    return h.response({
      message: "you posted an album! i-it's not like i like it or smth! hmph!",
    });
  },
};

export default [post];
