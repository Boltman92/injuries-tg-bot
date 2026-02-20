import { Injectable, Logger } from '@nestjs/common';
import { Impit, type ImpitResponse, type RequestInit } from 'impit';
import { PuppeteerService } from '../puppeteer/puppeteer.service';

@Injectable()
export class ImpitService {
  private readonly logger = new Logger(ImpitService.name);
  private readonly impit: Impit;

  constructor(private puppeteerService: PuppeteerService) {
    this.impit = new Impit({
      browser: 'chrome',
      ignoreTlsErrors: true,
      headers: {
        cookie: this.puppeteerService.cookieHeader ?? '',
        'x-mas': this.puppeteerService.xMasToken ?? '',
      },
    });
  }

  /**
   * Performs an HTTP request using the impit library (browser-like TLS fingerprint and headers).
   * API-compatible with the Fetch API.
   */
  async fetch(
    resource: string | URL,
    init?: RequestInit,
  ): Promise<ImpitResponse> {
    try {
      const response = await this.impit.fetch(resource, init);
      if (!response.ok) {
        this.logger.warn(
          `Request to ${response.url} returned ${response.status} ${response.statusText}`,
        );
      }
      return response;
    } catch (error) {
      this.logger.error(`Impit fetch failed: ${error}`);
      throw error;
    }
  }
}
