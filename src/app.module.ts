import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import getConfig from "./configruration";
import { MongooseModule } from "@nestjs/mongoose";
import { IConfig } from "./configruration/types";
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [getConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<IConfig>("app").mongoUri,
      }),
    }),
    UsersModule,
    StorageModule,
    AuthModule,
  ],
})
export class AppModule {}
