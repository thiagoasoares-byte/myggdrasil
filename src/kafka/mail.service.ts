import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

export interface MailSendOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly mailgunClient: ReturnType<Mailgun['client']> | null;
  private readonly mailgunDomain: string | null;
  private readonly fromAddress = process.env.MAIL_FROM ?? 'myggdrasil@example.com';
  private readonly provider: 'smtp' | 'mailgun' = (process.env.MAIL_PROVIDER as 'smtp' | 'mailgun') ?? 'smtp';

  constructor() {
    this.mailgunDomain = this.provider === 'mailgun' ? process.env.MAILGUN_DOMAIN ?? null : null;
    this.mailgunClient = this.provider === 'mailgun' ? this.createMailgunClient() : null;

    const devMode = process.env.MAIL_DEV ?? '';
    if (devMode === 'ethereal') {
      this.transporter = this.createEtherealTransporter();
    } else if (devMode === 'mailhog') {
      this.transporter = this.createMailhogTransporter();
    } else {
      this.transporter = this.createTransporter(this.defaultTransportFactory);
    }

    if (this.provider === 'mailgun' && (!this.mailgunClient || !this.mailgunDomain)) {
      this.logger.warn('Mailgun não configurado corretamente. Verifique MAILGUN_API_KEY e MAILGUN_DOMAIN.');
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Bem vindo, ${name}!</h1>
        <p>Você acaba de entrar para a MYGGDRASIL, a primeira e melhor árvore de decisões e escolhas.</p>
        <p>Confirme seu e-mail para liberar todos os benefícios e utilidades da plataforma.</p>
      </div>
    `;

    await this.sendMail({
      to,
      subject: 'Confirmação de E-mail - MYGGDRASIL',
      html,
    });
  }

  async sendMail(options: MailSendOptions): Promise<void> {
    if (this.provider === 'mailgun') {
      if (this.mailgunClient && this.mailgunDomain) {
        try {
          await this.mailgunClient.messages.create(this.mailgunDomain, {
            from: this.fromAddress,
            to: options.to,
            subject: options.subject,
            html: options.html,
          });
          return;
        } catch (err) {
          this.logger.error(`Falha ao enviar via Mailgun, tentando fallback SMTP: ${err}`);
        }
      } else {
        this.logger.warn(`Mailgun não configurado. Tentando fallback SMTP para ${options.to}.`);
      }
    }

    if (!this.transporter) {
      this.logger.warn(`E-mail não enviado para ${options.to} porque o transporte SMTP não está configurado.`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      if ((info as any)?.messageId && (info as any)?.envelope && process.env.MAIL_DEV === 'ethereal') {
        try {
          const nodemailerPkg = require('nodemailer');
          const url = nodemailerPkg.getTestMessageUrl(info);
          if (url) this.logger.log(`E-mail Ethereal preview: ${url}`);
        } catch (e) {}
      }
      return;
    } catch (err) {
      this.logger.error(`Falha no transporte SMTP ao enviar e-mail para ${options.to}: ${err}`);
      return;
    }
  }

  private createMailgunClient(): ReturnType<Mailgun['client']> | null {
    const apiKey = process.env.MAILGUN_API_KEY;
    const endpoint = process.env.MAILGUN_BASE_URL ?? 'https://api.mailgun.net';

    if (!apiKey) {
      this.logger.warn('MAILGUN_API_KEY não definido.');
      return null;
    }

    const mailgun = new Mailgun(FormData);

    return mailgun.client({
      username: 'api',
      key: apiKey,
      url: endpoint,
    });
  }

  protected createTransporter(createTransport: () => Transporter): Transporter | null {
    try {
      return createTransport();
    } catch (error) {
      this.logger.error('Falha ao criar o transporte de e-mail', error);
      return null;
    }
  }

  private defaultTransportFactory(): Transporter {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASSWORD para enviar e-mails.');
      throw new Error('SMTP config missing');
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  private createMailhogTransporter(): Transporter | null {
    try {
      return nodemailer.createTransport({ host: process.env.MAILHOG_HOST ?? 'localhost', port: Number(process.env.MAILHOG_PORT ?? 1025), secure: false });
    } catch (e) {
      this.logger.warn('Não foi possível criar transporte MailHog');
      return null;
    }
  }

  private createEtherealTransporter(): Transporter | null {
    try {
      const nodemailerPkg = require('nodemailer');
      return (async () => {
        const testAccount = await nodemailerPkg.createTestAccount();
        return nodemailerPkg.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
      })() as unknown as Transporter;
    } catch (e) {
      this.logger.warn('Não foi possível criar transporte Ethereal');
      return null;
    }
  }
}
