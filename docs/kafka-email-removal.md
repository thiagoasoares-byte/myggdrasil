# Remoção do Kafka e do envio de e-mail (produção)

**Data:** julho/2026

## O que existia antes

O fluxo de signup usava Kafka (Zookeeper + Kafka broker via `docker-compose`) como
message broker: ao criar uma conta, o `UsersService` emitia o evento `user.signup`,
que era consumido pelo `KafkaController` e disparava um e-mail de boas-vindas via
`MailService` (Nodemailer, com suporte a SMTP e Mailgun). Também existia um fluxo de
confirmação de e-mail com token (`EmailTokenEntity`, endpoint `POST /user/verify-email`).

## Por que foi removido

1. **Custo de hospedagem.** Kafka precisa de um processo persistente (+ Zookeeper)
   rodando 24/7 com memória razoável. Não há forma prática de hospedar isso de graça
   nos serviços de free tier atuais (Render, Fly.io, etc. dormem ou não suportam
   processos com esse perfil de recurso).
2. **Provedores de e-mail transacional com fricção.** Mailgun e Resend, no plano
   gratuito, exigem verificação de domínio/sandbox e limitam destinatários — o que
   travava o fluxo de verificação em produção mesmo com tudo configurado certo.
3. **Não era uma dependência funcional real.** O login nunca checou `email_verified`,
   então a etapa de e-mail não bloqueava nada — só adicionava uma dependência de
   infraestrutura sem benefício prático pro estágio atual do projeto.

## O que mudou no código

- Removida a pasta `src/kafka/` (`KafkaController`, `MailService`).
- `UsersService.signupPost` não emite mais evento Kafka nem cria `EmailTokenEntity`.
- `main.ts` não conecta mais um microservice Kafka (`app.connectMicroservice`).
- `AppModule` e `UsersModule` não referenciam mais Kafka.
- `docker-compose.yml` ficou só com o serviço `app`.
- Mensagem de sucesso no signup do frontend não menciona mais "verifique seu e-mail".

## O que **não** foi removido (de propósito)

- `EmailTokenEntity`, a tabela `email_token` e o endpoint `POST /user/verify-email`
  continuam existindo no banco/código. Não são usados no fluxo atual, mas ficam
  disponíveis caso o envio de e-mail volte a ser viável no futuro (ex: hospedando um
  worker separado, ou usando um serviço de e-mail transacional mais tolerante a plano
  gratuito).

## Se quiser trazer de volta no futuro

A forma mais simples seria trocar Kafka por algo mais leve pra esse volume (ex: uma
fila gerenciada como Upstash QStash, ou simplesmente chamar o envio de e-mail direto
de forma síncrona/assíncrona no próprio `signupPost`, sem broker nenhum).
