import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { UserEntity } from '../user/user.entity'
import * as path from 'path'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: UserEntity, token: string) {
    const url = `http://${process.env.CLIENT_URL}/login?id=${user.id}&code=${token}`

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to COVID-Navigator App! Confirm your Email',
      template: './confirmation',
      context: {
        name: user.username,
        url,
      },
      attachments: [
        {
          filename: 'COVID_Navigator_Test_Scipt_Survey_050621.pdf',
          path: path.join(
            __dirname,
            '../../../public/COVID_Navigator_Test_Scipt_Survey_050621.pdf'
          ),
          contentType: 'application/pdf',
        },
      ],
    })
  }

  async sendNotification(user: UserEntity) {
    await this.mailerService.sendMail({
      to: [process.env.MAIL_NOTIFICATION, 'a.belotserkovskaya@softarex.com'],
      subject: 'Welcome to COVID-Navigator App!',
      template: './notification',
      context: {
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.role.role,
      },
    })
  }
}
