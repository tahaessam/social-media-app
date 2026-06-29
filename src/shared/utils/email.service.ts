import nodemailer from 'nodemailer';

class EmailService {
  private transporter: any;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      // No email credentials configured — use a noop transporter to avoid throwing during tests/dev
      console.warn('Email credentials not configured; EmailService will noop sendEmail.');
      this.transporter = {
        sendMail: async (_: any) => {
          return Promise.resolve();
        },
      };
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      });
    } catch (err: any) {
      console.warn('EmailService.sendEmail failed:', err?.message || err);
    }
  }
}

export default new EmailService();
