import { IMailProvider } from "../email/mail.interface.js";
import { NodemailerProvider } from "../email/nodemailer/nodemailer.service.js";

class NoopMailProvider implements IMailProvider {
  async sendMail(_to: string, _subject: string, _html: string): Promise<void> {
    return Promise.resolve();
  }
}

const createMailProvider = (): IMailProvider => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("Email credentials are not configured; falling back to NoopMailProvider.");
    return new NoopMailProvider();
  }

  return new NodemailerProvider({
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user,
      pass,
    },
    defaultFrom: process.env.EMAIL_FROM || user,
  });
};

const mailProvider = createMailProvider();

export default mailProvider;
