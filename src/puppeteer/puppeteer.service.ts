import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class PuppeteerService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private browser: Browser | null = null;
  private readonly logger = new Logger(PuppeteerService.name);
  public xMasToken: string | null = null;

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  async getBrowser(): Promise<Browser> {
    // Check if browser exists and is still connected
    if (this.browser) {
      try {
        // Test if browser is still connected by checking if we can get pages
        await this.browser.pages();
      } catch {
        this.logger.warn('Browser connection closed, relaunching...');
        this.browser = null;
      }
    }

    if (!this.browser) {
      this.logger.log('Launching Puppeteer...');
      this.browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
    }
    return this.browser;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async getXmasToken() {
    let page: Page | null = null;
    try {
      this.logger.log('Getting x-mas token...');
      const browser = await this.getBrowser();
      page = await browser.newPage();

      const requestHandler = (req: HTTPRequest) => {
        if (req.url().includes('allLeagues')) {
          console.log('Headers:', req.headers()['x-mas']);
          this.xMasToken = req.headers()['x-mas'] as string | null;
        }
      };

      page.on('request', requestHandler);

      await page.goto('https://www.fotmob.com', { waitUntil: 'networkidle2' });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Remove event listener before closing to prevent memory leak
      page.off('request', requestHandler);
      await page.close();
    } catch (error) {
      this.logger.error('Error getting x-mas token:', error);
      // Ensure page is closed even on error
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch (closeError) {
          this.logger.error('Error closing page:', closeError);
        }
      }
    }
  }

  async parseScriptTagFromUrl<T>(url: string): Promise<T | null> {
    let page: Page | null = null;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      const data = await page.evaluate(() => {
        const nextData =
          document.getElementById('__NEXT_DATA__')?.innerHTML ?? '{}';
        const data = JSON.parse(nextData) as {
          props: {
            pageProps: {
              data: T;
            };
          };
        };
        return data.props?.pageProps?.data;
      });
      return data;
    } catch (error) {
      this.logger.error('Error parsing script tag:', error);
      return null;
    } finally {
      if (page && !page.isClosed()) {
        await page.close();
      }
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('Closing Puppeteer browser...');
      try {
        // Close all pages before closing browser
        const pages = await this.browser.pages();
        await Promise.all(pages.map((page) => page.close().catch(() => {})));
        await this.browser.close();
        this.browser = null;
      } catch (error) {
        this.logger.error('Error closing Puppeteer browser:', error);
      }
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
