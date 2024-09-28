import Joi from "joi";

export type Album = {
  id?: string;
  name: string;
  year: number;
  cover_url?: string;
};

export const albumPayload = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});
