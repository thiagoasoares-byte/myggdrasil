import { MailService } from './mail.service';

describe('MailService', () => {
  it('should send a welcome email with the expected payload', async () => {
    const calls: Array<Record<string, unknown>> = [];

    class TestMailService extends MailService {
      constructor() {
        super();
      }

      protected createTransporter() {
        return {
          sendMail: async (options: Record<string, unknown>) => {
            calls.push(options);
            return { messageId: 'msg-1' };
          },
        } as any;
      }
    }

    const service = new TestMailService();

    await service.sendWelcomeEmail('user@example.com', 'Ana');

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      from: 'myggdrasil@example.com',
      to: 'user@example.com',
      subject: 'Confirmação de E-mail - MYGGDRASIL',
    });
    expect(calls[0].html).toContain('Ana');
  });
});
