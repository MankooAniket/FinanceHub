const axios = require("axios");

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      const reply = getSmartResponse(message);
      return res.status(200).json({
        success: true,
        reply,
      });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
You are a smart built-in AI assistant for a Finance Expense Tracker app.

APP FEATURES:
- Login & Signup
- Add/Edit/Delete Income
- Add/Edit/Delete Expenses
- Budget Management
- Analytics & Reports
- Multi Currency
- Profile Management

INSTRUCTIONS:
- Answer step-by-step.
- Be helpful and practical.
- If technical issue → suggest refresh/login again.
- If serious issue → tell user to go to Contact page.
- Mention support replies within 2–3 working days.
- Keep answers clear and structured.

User Question: ${message}
Reply:
`,
              },
            ],
          },
        ],
      }
    );

    const aiReply =
      response.data.candidates[0].content.parts[0].text;

    res.status(200).json({
      success: true,
      reply: aiReply.trim(),
    });
  } catch (error) {
    const reply = getSmartResponse(req.body.message);
    res.status(200).json({
      success: true,
      reply,
    });
  }
};



function getSmartResponse(message) {
  const msg = message.toLowerCase();

  
  if (msg.includes("login")) {
    return `Login Steps:

1️⃣ Go to Login page  
2️⃣ Enter registered email & password  
3️⃣ Click Login  

If login fails:
• Check email spelling  
• Reset password  
• Refresh page  

Still facing issue? Please visit Contact page and describe your problem. Our team usually replies within 2–3 working days.`;
  }

  
  if (msg.includes("signup") || msg.includes("register")) {
    return `Signup Steps:

1️⃣ Go to Signup page  
2️⃣ Enter name, email & password  
3️⃣ Click Create Account  

Make sure password is strong.  
If error occurs, use Contact page for support.`;
  }

  if (msg.includes("password") || msg.includes("forgot")) {
    return `Reset Password:

1️⃣ Click "Forgot Password"  
2️⃣ Enter your email  
3️⃣ Verify OTP  
4️⃣ Set new password  

If OTP not received, contact support via Contact page.`;
  }

  if (msg.includes("add") && (msg.includes("income") || msg.includes("expense"))) {
    return `To Add Transaction:

1️⃣ Click Income or Expenses in sidebar  
2️⃣ Enter title, amount & category  
3️⃣ Click Add  

Dashboard updates instantly.`;
  }

  
  if (msg.includes("delete account")) {
    return `Delete Account:

1️⃣ Go to Profile  
2️⃣ Scroll to Danger Zone  
3️⃣ Click Delete Account  

⚠ This action is permanent.`;
  }

  if (msg.includes("budget")) {
    return `Budget Help:

• Use 50/30/20 rule  
• Set monthly limit  
• Track progress in Analytics  

Need planning help? Tell me your income.`;
  }

  if (msg.includes("report") || msg.includes("download")) {
    return `Download Report:

1️⃣ Go to Reports  
2️⃣ Select date range  
3️⃣ Choose PDF/CSV  
4️⃣ Download  

Great for financial tracking.`;
  }

  if (msg.includes("save") || msg.includes("saving")) {
    return `Saving Tips:

• Save at least 20% income  
• Avoid impulse spending  
• Track daily expenses  
• Cancel unused subscriptions  

Consistency matters!`;
  }

  if (msg.includes("error") || msg.includes("not working") || msg.includes("bug")) {
    return `If app is not working:

• Refresh page  
• Logout & login again  
• Clear browser cache  

If problem continues, please go to Contact page and explain clearly. Our team replies within 2–3 working days.`;
  }

  return `I can help with:

• Login & account issues  
• Adding income/expenses  
• Budget setup  
• Reports & analytics  
• Saving tips  

If you're facing a serious technical issue, please visit the Contact page and describe your problem clearly. Support usually replies within 2–3 working days.

What would you like help with?`;
}

module.exports = { chat };
