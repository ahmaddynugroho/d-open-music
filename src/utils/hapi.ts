import { ReqRefDefaults, Request, ResponseToolkit } from "@hapi/hapi";

export function getRequestBody<T>(request: Request<ReqRefDefaults>): T {
  return Object.assign({}, request.payload) as T;
}

export function getRequestParams<T>(request: Request<ReqRefDefaults>): T {
  return Object.assign({}, request.params) as T;
}

export function badPayloadResponse(
  h: ResponseToolkit<ReqRefDefaults>,
  errorMessage?: string,
) {
  return h
    .response({
      status: "fail",
      message: errorMessage ?? "bad payload",
    })
    .code(400);
}

export function notFoundResponse(
  h: ResponseToolkit<ReqRefDefaults>,
  errorMessage?: string,
) {
  return h
    .response({
      status: "fail",
      message: errorMessage ?? "not found",
    })
    .code(404);
}

export function serverErrorResponse(h: ResponseToolkit<ReqRefDefaults>) {
  return h
    .response({
      status: "error",
      message: "Server error",
    })
    .code(500);
}
