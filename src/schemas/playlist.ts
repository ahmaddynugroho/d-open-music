import Joi from "joi";

export const playlistPayload = Joi.object({
  name: Joi.string().required(),
});
