import { Test, TestingModule } from '@nestjs/testing';
import { KafkaController } from './kafka.controller';
import { MailService } from './mail.service';

describe('KafkaController', () => {
  let controller: KafkaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaController],
      providers: [
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<KafkaController>(KafkaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
