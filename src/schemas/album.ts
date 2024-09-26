import Joi from "joi";

export type Album = {
  name: string;
  year: number;
};

export const albumPayload = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});
