import Joi from "joi";

const albumPayload = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

export default albumPayload;
