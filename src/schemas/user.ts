import Joi from "joi";

export type User = {
  username: string;
  password: string;
  fullname: string;
};

export const userPayload = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});
