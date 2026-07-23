import { Controller, Logger } from '@nestjs/common';
import { Ctx, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { MailService } from './mail.service';

@Controller()
export class KafkaController {
  private readonly logger = new Logger(KafkaController.name);

  constructor(private readonly mailService: MailService) {}

  @MessagePattern('user.signup')
  async handleUserSignup(@Payload() payload: any, @Ctx() context: KafkaContext) {
    this.logger.log({ payload });

    try {
      const { email, name } = payload;
      await this.mailService.sendWelcomeEmail(email, name);
      this.logger.log(`E-mail de boas-vindas enviado para ${email}`);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
