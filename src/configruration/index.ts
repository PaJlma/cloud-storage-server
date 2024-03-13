import { GetConfig } from "./types";

const getConfig: GetConfig = () => ({
  app: {
    port: parseInt(process.env.PORT),
    mongoUri: process.env.MONGO_URI,
    accessSecret: process.env.ACCESS_SECRET,
    refreshSecret: process.env.REFRESH_SECRET,
    accessExpiration: process.env.ACCESS_EXPIRATION,
    refreshExpiration: process.env.REFRESH_EXPIRATION,
  },
});

export default getConfig;
