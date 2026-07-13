export interface IMailProvider {
    // !any mail provider should implement this interface
    sendMail(to: string, subject: string, html: string): Promise<void>;
}