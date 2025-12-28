import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MantraService {
  private readonly logger = new Logger(MantraService.name);
  private email: string;
  private password: string;
  constructor(
    private puppeteerService: PuppeteerService,
    private configService: ConfigService,
  ) {
    const email = this.configService.get<string>('MANTRA_EMAIL') ?? '';
    const password = this.configService.get<string>('MANTRA_PASSWORD') ?? '';
    if (!email || !password) {
      throw new Error('MANTRA_EMAIL and MANTRA_PASSWORD are required');
    }
    this.email = email;
    this.password = password;
  }

  async getMantraTeam(url: string) {
    try {
      const browser = await this.puppeteerService.getBrowser();
      const page = await browser.newPage();
      await this.login(page);
      await page.goto(url, { waitUntil: 'networkidle2' });
      const team: string[] = await page.evaluate(() => {
        const surnamesArray = Array.from(
          document.querySelectorAll('.team-player-last-name'),
        )
          .slice(0, 26)
          .map((el) => {
            console.log(el);
            //this.logger.log(el.textContent);
            return el.textContent.replace(/\n/g, '');
          });
        const namesArray = Array.from(
          document.querySelectorAll('.team-player-first-name'),
        )
          .slice(0, 26)
          .map((el) => {
            return el.textContent.replace(/\n/g, '');
          });
        return surnamesArray.map((surname, index) => {
          return `${namesArray[index]} ${surname}`;
        });
      });
      console.log(team);
      //this.logger.log(team);
      return team;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  private async login(page: puppeteer.Page) {
    await page.goto('https://mantrafootball.org/users/sign_in', {
      waitUntil: 'networkidle2',
    });
    await page.type('input[name="user[email]"]', this.email);
    await page.type('input[name="user[password]"]', this.password);
    await page.click('input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
  }
}
