import "dotenv/config";
import amqp from "amqplib/callback_api.js";
import nodemailer from "nodemailer";

// Looking to send emails in production? Check out our Email API/SMTP product!
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = (targetEmail, content) => {
  const message = {
    from: "Notes Apps",
    to: targetEmail,
    subject: "Ekspor Catatan",
    text: "Terlampir hasil dari ekspor catatan",
    attachments: [
      {
        filename: "notes.json",
        content,
      },
    ],
  };
  return transport.sendMail(message);
};

amqp.connect(process.env.RABBITMQ_SERVER, function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const queue = "export:playlist";
    channel.assertQueue(queue, {
      durable: true,
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      async (msg) => {
        const { targetEmail, content } = JSON.parse(msg.content.toString());
        const res = await send(targetEmail, JSON.stringify(content));
        console.log(res);

        // transport.sendMail(msg.content.toString(), () => {
        //   console.log(" [x] Received %s", msg.content.toString());
        // });
      },
      {
        noAck: true,
      },
    );
  });
});
