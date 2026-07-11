import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { Ctx, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { Resend } from 'resend';

@Controller()
export class KafkaController implements OnModuleInit {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly logger = new Logger(KafkaController.name);

  async onModuleInit() {
    await this.resend.domains.create({ name: 'myggdrasil.com' });
  }

  @MessagePattern('user.signup')
  async handleUserSignup(@Payload() payload: any, @Ctx() context: KafkaContext){
    this.logger.log({ payload });
    
    try{
      const {email, name} = payload
      const {data} = await this.resend.emails.send({
        from: 'MYGGDRASIL <myggdrasil@gmail.com>',
        to: [email],
        subject: 'Confirmação de E-mail, MYGGDRASIL',
        html: `<header><strong><h1>Bem vindo ${name} a MYGGDRASIL! A primeira e melhor arvoré de decisões e escolhas.</h1></strong></header><body><h2>Porfavor, faça a confirmação do e-mail para que possamos liberar todos os benefícios e utilidades da MYYGDRASIL.</h2><button type="button">Confirme seu e-mail</button></body>`
      })
      this.logger.log({data})
    }catch(error){
      this.logger.error(error)
      throw error
    }
  }

}
