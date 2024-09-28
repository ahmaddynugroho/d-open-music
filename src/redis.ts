import { createClient } from "redis";

const expirationInSeconds = 1800;

const redis = createClient({
  socket: {
    host: process.env.REDIS_SERVER,
  },
});

redis.on("error", (err) => console.log(err));

redis.connect();

export const setRedisCache = async (key: string, value: string) => {
  await redis.set(key, value, {
    EX: expirationInSeconds,
  });
};

export const getRedisCache = async (key: string) => {
  return await redis.get(key);
};

export const deleteRedisCache = async (key: string) => {
  return await redis.del(key);
};

const likeCountCacheName = "like_count";

export const setLikeCountCache = async (count: string | number) => {
  await setRedisCache(likeCountCacheName, String(count));
};

export const getLikeCountCache = async () => {
  try {
    return await getRedisCache(likeCountCacheName);
  } catch {
    return null;
  }
};
