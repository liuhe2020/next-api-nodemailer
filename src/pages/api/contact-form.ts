// import type { NextApiRequest, NextApiResponse } from 'next';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import nodemailer from 'nodemailer';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const recaptchaKey = process.env.RECAPTCHA_SITE_KEY!;
  const mailFrom = process.env.GMAIL_ADDRESS!;
  const mailTo = process.env.YAHOO_ADDRESS!;
  const requestSite = req.headers.origin?.slice(12); // remove first part of the url
  const { data, recaptchaToken } = req.body;

  // handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // handle empty request
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send('No request body');
  }

  try {
    // google recaptcha enterprise
    const client = new RecaptchaEnterpriseServiceClient({
      credentials: {
        client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL!,
        private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      },
    });

    const projectPath = client.projectPath('next-api-nodemailer');

    const request = {
      assessment: {
        event: {
          token: recaptchaToken,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    // handle recaptcha
    if (response.tokenProperties?.valid === false) {
      return res.status(400).send({ message: 'Invalid token' });
    }

    if (response.tokenProperties?.action !== 'submitForm') {
      return res.status(400).send({ message: 'Invalid action' });
    }

    if (response.riskAnalysis?.score && response.riskAnalysis.score < 0.5) {
      return res.status(400).send({ message: 'Spam detected' });
    }

    // nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: mailFrom,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let html = '';
    for (const key in data) {
      html += '<p>' + key + ': ' + data[key] + '</p>';
    }

    const mailData = {
      from: { name: requestSite!, address: mailFrom },
      to: mailTo,
      replyTo: data.email,
      subject: `${requestSite} contact form - ${data.name}`,
      text: html,
      html,
    };

    const mailRes = await transporter.sendMail(mailData);
    return res.status(200).send(mailRes);
  } catch (err) {
    return res.status(500).send(err);
  }
}
