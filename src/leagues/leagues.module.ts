import { Module } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League } from './entity/League';

@Module({
  imports: [TypeOrmModule.forFeature([League])],
  providers: [LeaguesService],
  exports: [LeaguesService],
})
export class LeaguesModule {}
