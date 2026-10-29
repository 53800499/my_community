import { Module } from '@nestjs/common';
import { PlatformConfigModule } from './platform/config/config.module.js';
import { DatabaseModule } from './platform/database/database.module.js';
import { AuditModule } from './modules/audit/index.js';
import { TerritoriesModule } from './modules/territories/index.js';
import { CommunitiesModule } from './modules/communities/index.js';
import { IdentityModule } from './modules/identity/index.js';
import { UsersModule } from './modules/users/index.js';
import { NotificationsModule } from './modules/notifications/index.js';
import { MembershipsModule } from './modules/memberships/index.js';
import { AssociationsModule } from './modules/associations/index.js';
import { ResidencesModule } from './modules/residences/index.js';
import { SocialModule } from './modules/social/index.js';
import { EventsModule } from './modules/events/index.js';
import { FinanceModule } from './modules/finance/index.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    PlatformConfigModule,
    DatabaseModule,
    AuditModule,
    TerritoriesModule,
    CommunitiesModule,
    IdentityModule,
    UsersModule,
    NotificationsModule,
    MembershipsModule,
    AssociationsModule,
    ResidencesModule,
    SocialModule,
    EventsModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
