import { DynamicModule } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';
export declare class ConnectionModule {
    static forRoot(): DynamicModule;
    static forPlugin(): DynamicModule;
    static getTypeOrmLogger(dbConnectionOptions: ConnectionOptions): "debug" | import("typeorm").Logger | "advanced-console" | "simple-console" | "file";
}
