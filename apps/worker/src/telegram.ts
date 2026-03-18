import axios from "axios";

export async function telegramSendMessage(opts: {
  botToken: string;
  chatId: string;
  text: string;
}) {
  const { botToken, chatId, text } = opts;
  await axios.post(
    `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
    {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    },
    { timeout: 30_000 }
  );
}

