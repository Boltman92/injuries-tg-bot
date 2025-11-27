import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class PuppeteerService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private browser: Browser | null = null;
  private readonly logger = new Logger(PuppeteerService.name);
  public xMasToken: string | null = null;

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.logger.log('Launching Puppeteer...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async getXmasToken() {
    try {
      this.logger.log('Getting x-mas token...');
      const browser = await this.getBrowser();
      const page = await browser.newPage();

      page.on('request', (req) => {
        if (req.url().includes('allLeagues')) {
          console.log('Headers:', req.headers()['x-mas']);
          this.xMasToken = req.headers()['x-mas'];
        }
      });

      await page.goto('https://www.fotmob.com', { waitUntil: 'networkidle2' });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await page.close();
    } catch (error) {
      this.logger.error('Error getting x-mas token:', error);
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('Closing Puppeteer browser...');
      await this.browser.close();
    }
  }

  async onModuleInit() {
    await this.getXmasToken();
  }

  onApplicationBootstrap() {
    const jobs = this.schedulerRegistry.getCronJobs();
    this.logger.log('Registered cron jobs:', Array.from(jobs.keys()));
  }
}
