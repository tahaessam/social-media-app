import nodemailer, { Transporter } from "nodemailer";
import { IMailProvider } from "../mail.interface.js";
import type { SendMailOptions } from "nodemailer";
interface NodeMailerConfig {
  service: string;
  host: string;
  port: number;
  secure: boolean;
  defaultFrom?: string;
  auth: {
    user: string;
    pass: string;
  };
}

export class NodemailerProvider implements IMailProvider {
  private transporter: Transporter;
  private defaultFrom: string | undefined;

  constructor(config: NodeMailerConfig) {
    this.defaultFrom = config.defaultFrom;
    this.transporter = nodemailer.createTransport({
      service: config.service,
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.defaultFrom,
      to,
      subject,
      html,
    });
  }
}
