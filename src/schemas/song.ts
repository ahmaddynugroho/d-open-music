import Joi from "joi";

export type Song = {
  title: string;
  year: number;
  genre: string;
  performer: string;
  duration: number;
  albumId: string;
};

export const songPayload = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});
