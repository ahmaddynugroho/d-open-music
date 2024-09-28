import Joi from "joi";

export const playlistPayload = Joi.object({
  name: Joi.string().required(),
});

export const playlistSongPayload = Joi.object({
  songId: Joi.string().required(),
});

export const exportPlaylistPayload = Joi.object({
  targetEmail: Joi.string().required(),
});
