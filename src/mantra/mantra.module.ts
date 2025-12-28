import { Module } from '@nestjs/common';
import { MantraService } from './mantra.service';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';

@Module({
  imports: [PuppeteerModule],
  providers: [MantraService],
  exports: [MantraService],
})
export class MantraModule {}
