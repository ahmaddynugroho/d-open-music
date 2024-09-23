import { Request } from "@hapi/hapi";

export function getRequestBody<T>(request: Request): T {
  return Object.assign({}, request.payload) as T;
}
