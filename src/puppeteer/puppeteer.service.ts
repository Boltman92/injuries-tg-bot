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

const DEFAULT_COOKIE_HEADER =
  '_cc_id=4ebe1cb5c20a9a30add7c328cee7d78c; _hjSessionUser_2585474=eyJpZCI6IjIwNzRkZGE1LTNmY2QtNTEwMC04NDI1LWZiNjIzNTRmMGU3ZiIsImNyZWF0ZWQiOjE3MzIyOTI4MzgxNDAsImV4aXN0aW5nIjp0cnVlfQ==; fbuser=%7B%22displayName%22%3A%22%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%20%D0%A0%D0%B0%D0%B7%D0%B1%D0%B5%D0%B9%D0%BA%D0%BE%D0%B2%22%2C%22name%22%3A%22%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%20%D0%A0%D0%B0%D0%B7%D0%B1%D0%B5%D0%B9%D0%BA%D0%BE%D0%B2%22%2C%22image%22%3A%22https%3A%2F%2Fplatform-lookaside.fbsbx.com%2Fplatform%2Fprofilepic%2F%3Fasid%3D8593475447414770%26height%3D50%26width%3D50%26ext%3D1768926099%26hash%3DAT_X2tUXB8HWFxXqdrsLiVJR%22%2C%22id%22%3A%228593475447414770%22%7D; _gcl_au=1.1.426160084.1770717126; _ga_SQ24F7Q7YW=GS2.1.s1770759319$o311$g0$t1770759322$j57$l0$h0; u:location=%7B%22countryCode%22%3A%22UA%22%2C%22regionId%22%3A%2230%22%2C%22ip%22%3A%22127.0.0.1%22%2C%22ccode3%22%3A%22UKR%22%2C%22ccode3NoRegion%22%3A%22UKR%22%2C%22timezone%22%3A%22Europe%2FKiev%22%7D; _gid=GA1.2.1228462855.1771524833; _ga_K2ECMCJBFQ=GS2.1.s1771524833$o313$g0$t1771524833$j60$l0$h0; _ga=GA1.1.2058766617.1721764251; cto_bundle=F512XF9peEFGbWZ4ZW1IQXdqd1psUVQwSUhoMHUzSFlDR040QTFPeUc3bFZiRTFwdjlhb1Z5MkRFY2hMbnpzejh6JTJCUGtjZmNwJTJGMFhVYURGb0tlODR2RzhrZlNjJTJGMkJMTU82ZjJRR2hQVlVVOFZjVVhMNjhnQ2N1ZDVKSzNXWnJmRThlRFVBNyUyRm43UXBaVWJYOFNYU0JqNWRGWGl0cHN5Ym1DWmMxTmtQZGZoR1ZoSyUyQlp5ZlphZTBhd1B4QjkyY3hvbkZ3; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%22ff90fab4-353e-41ab-82a6-3e14ff8016ef%5C%22%2C%5B1761680252%2C509000000%5D%5D%22%5D%5D%5D; g_state={"i_p":1771586281505,"i_l":4,"i_ll":1771536796514,"i_b":"VGgyHNZu0dUG/FTgLW4t/jj8MijOhkp0/z7b1adxSwE","i_e":{"enable_itp_optimization":0}}; FCNEC=%5B%5B%22AKsRol8eF-6qUHVE6eyH9rXreptz87tUxiwuQGO9cAj9lGbn_NDrVYH8V-C4PLwB9HdBtrLgQnbKRPMhVH1TP9qJU3JNlcT_SrboQ6Ib6StNvKOu96OE1OXGS7rBXg5LnKP2S0Q4WhWdmYALqzcDNzS7ovntofrobw%3D%3D%22%5D%5D; turnstile_verified=1.1771569455.523ee51a91f9b835c8d8bdd3d4d8614b53b9c3e62835384282e206fd8e2adaa3; _ga_G0V1WDW9B2=GS2.1.s1771569459$o1305$g0$t1771569459$j60$l0$h1644025585';
@Injectable()
export class PuppeteerService
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private browser: Browser | null = null;
  private readonly logger = new Logger(PuppeteerService.name);
  public xMasToken: string | null = null;
  public cookieHeader: string | null = DEFAULT_COOKIE_HEADER;

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

      const client = await page.createCDPSession();

      // Enable the Network domain
      await client.send('Network.enable');

      // Listen for the "ExtraInfo" event which contains the final headers
      client.on('Network.requestWillBeSentExtraInfo', (params) => {
        if (params.headers['cookie']) {
          console.log('Headers with Cookies:', params.headers['cookie']);
          this.cookieHeader = params.headers['cookie'] as string | null;
        }
      });

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
