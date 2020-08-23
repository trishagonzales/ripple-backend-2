import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import sendgrid from 'nodemailer-sendgrid';
import { config } from './config';
import { logger } from './logger';

const log = logger.extend('Mail');

export class Mail {
  public email: string;
  public content?: string;

  constructor(email: string) {
    this.email = email;
  }

  //  SEND EMAIL
  async send(subject: string = 'Confirm') {
    const transport = nodemailer.createTransport(sendgrid({ apiKey: config.SENDGRID_API_KEY as string }));

    await transport.sendMail({
      from: 'trishagonzales.dev@gmail.com',
      to: this.email,
      subject,
      html: this.content,
    });
  }

  //  CREATE CONFIRMATION HTML CONTENT
  createConfirmationHtml(userId: string, description: string, urlType: 'validate-email' | 'forgot-password') {
    let url;
    let token;

    if (config.JWT_KEY) {
      token = jwt.sign({ userId }, config.JWT_KEY, {
        expiresIn: urlType === 'forgot-password' ? '1d' : '100d',
      });
    } else {
      log('Failed to create confirmation html. JWT_KEY not set');
    }

    if (urlType === 'validate-email') url = `${config.BACKEND_URL}/api/users/email/validate/${token}`;
    if (urlType === 'forgot-password') url = `${config.FRONTEND_URL}/reset-password/${token}`;

    this.content = `
      <html>
        <head>
          <style>
            .container {
              max-width: 600px;
              margin: auto;
              padding: 2.5em 1em;
              font-family: sans-serif;
              font-size: 16px;
            }
            .description {
              margin: 2em 0;
            }
            .confirm-button {
              padding: 0.7em 1em;
              background: dodgerblue;
              border-radius: 5px;
              box-shadow: 1px 2px 10px #ddd;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              color: white;
              text-decoration: none;
              cursor: pointer;
            }
            .url {
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <p class="description">${description}</p>
            <a class="confirm-button" href="${url}">${urlType === 'forgot-password' ? 'RESET' : 'CONFIRM'}</a>
            <p class="description">If button above didn't work, copy the url below and paste in browser.</p>
            <p class="url">${url}</p>
          </div>
        </body>
      </html>
    `;

    // this.content = `
    //   <div style="
    //       width: 60%;
    //       height: auto;
    //       margin: auto;
    //       padding: 2.5em 1em;
    //       display: flex;
    //       flex-direction: column;
    //       align-items: center;
    //       border-radius: 5px;
    //       box-shadow: 1px 2px 15px #ddd;
    //       font-family: sans-serif;
    //     "
    //   >
    //     <p style="font-size: 16px;">${description}</p>
    //     <a href="${url}"
    //       style="
    //         margin: 1.2em 0;
    //         padding: 0.7em 1em;
    //         background: dodgerblue;
    //         border-radius: 5px;
    //         box-shadow: 1px 2px 10px #ddd;
    //         font-size: 16px;
    //         font-weight: bold;
    //         color: white;
    //         text-decoration: none;
    //       "
    //     >${urlType === 'forgot-password' ? 'RESET' : 'CONFIRM'}</a>
    //     <p style="margin-bottom: 1em; font-size: 14px;">
    //       If the button above didn't work, you can copy the url below:
    //     </p>
    //     <a href="${url}">${url}</a>
    //   </div>
    // `;
  }
}
