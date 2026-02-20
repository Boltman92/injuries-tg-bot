import { Module } from '@nestjs/common';
import { ImpitService } from './impit.service';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';

@Module({
  imports: [PuppeteerModule],
  providers: [ImpitService],
  exports: [ImpitService],
})
export class ImpitModule {}
