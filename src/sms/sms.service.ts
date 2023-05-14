import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;

  constructor(private readonly cfg: ConfigService) {
    const accountSid = cfg.get('TWILIO_ACCOUNT_SID');
    const authToken = cfg.get('TWILIO_AUTH_TOKEN');

    this.twilioClient = new Twilio(accountSid, authToken);
  }
}
