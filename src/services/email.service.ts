import path from 'node:path';

import nodemailer, { Transporter } from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';

import { configs } from '../configs/config';
import { emailConstants } from '../constants/email.constants';
import { EmailTypeEnum } from '../enums/email-type.enum';
import { EmailTypeToPayloadType } from '../types/email-type-to-payload.types';

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      from: configs.SMTP_EMAIL,
      auth: {
        user: configs.SMTP_EMAIL,
        pass: configs.SMTP_PASSWORD,
      },
    });

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          partialsDir: path.join(process.cwd(), 'src', 'templates', 'partials'),
          layoutsDir: path.join(process.cwd(), 'src', 'templates', 'layouts'),
          defaultLayout: false,
        },
        viewPath: path.join(process.cwd(), 'src', 'templates', 'views'),
        extName: '.hbs',
      }),
    );
  }

  public async sendEmail<T extends EmailTypeEnum>(
    type: T,
    to: string,
    context: EmailTypeToPayloadType[T],
  ): Promise<void> {
    const { subject, template } = emailConstants[type];

    context['verifyUrl'] = `${configs.VERIFY_URL}:${configs.API_PORT}/api/auth`;
    const options = {
      to,
      subject,
      template,
      context,
    };
    await this.transporter.sendMail(options);
  }
}

export const emailService = new EmailService();
