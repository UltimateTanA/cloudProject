const { google } = require("googleapis");
async function getLatestEmail(gmailClient) {
  try {
    const res = await gmailClient.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: 1,
      orderBy: "descending" 
    });

    const messages = res.data.messages;
    if (!messages || messages.length === 0) {
      console.log("No messages found");
      return null;
    }
    const msgId = messages[0].id;
    const msgRes = await gmailClient.users.messages.get({
      userId: "me",
      id: msgId,
      format: "full"
    });

    const payload = msgRes.data.payload;
    const headers = payload.headers;
    const subjectHeader = headers.find(h => h.name === "Subject");
    const fromHeader = headers.find(h => h.name === "From");

    const latestEmail = {
      id: msgRes.data.id,
      threadId: msgRes.data.threadId,
      from: fromHeader ? fromHeader.value : "",
      subject: subjectHeader ? subjectHeader.value : "",
      snippet: msgRes.data.snippet,
    };
    console.log("Latest email fetched:", latestEmail);
    
    return latestEmail;
  } catch (err) {
    console.error("Error fetching latest email:", err.message);
    return null;
  }
}
