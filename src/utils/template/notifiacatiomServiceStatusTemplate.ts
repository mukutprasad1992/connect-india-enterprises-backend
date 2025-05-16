export const emailTemplates = {
  Approved: (serviceSubType: string) => {
    return `
      <div >
        <h3 >🎉 Great News: Your <strong style="color: #4CAF50;">${serviceSubType}</strong> Request Has Been Approved!</h3>

        <p style="font-size: 12px; color: #555;">Hello User,</p>
        <p style="font-size: 12px; color: #555;">Thank you for choosing Connect India Enterprises!</p>
        <p style="font-size: 12px; color: #555;">
          We’re thrilled to let you know that your request regarding <strong>${serviceSubType}</strong> has been approved. ✅
        </p>

        <p style="font-size: 12px; color: #555;">Here's what you can expect next:</p>
        <ul style="font-size: 12px; color: #555;">
          <li>A confirmation email with further details.</li>
          <li>Steps to proceed with your approved request.</li>
          <li>Continued assistance from our support team.</li>
        </ul>

        <p style="font-size: 12px; color: #555;">
          Track your request anytime by logging into your account: <br />
          <a href="http://localhost:3000/authentication/login">👉 Login to Dashboard</a>
        </p>

        <p style="font-size: 12px; color: #555;">
          Need help? Reach us at:<br />
          📩 support@connectindia.com | 📞 +91-7898191919
        </p>

        <p style="font-size: 12px; color: #555;">
          Warm regards,<br />
          The Connect India Enterprises Team 🌟
        </p>
      </div>
    `;
  },

  Rejected: (serviceSubType: string) => {
    return `
      <div >
        <h3>❌ Update: Your <strong style="color: #E53935;">${serviceSubType}</strong> Request Has Been Rejected</h3>

        <p style="font-size: 12px; color: #555;">Hello User,</p>
        <p style="font-size: 12px; color: #555;">Thank you for choosing Connect India Enterprises.</p>
        <p style="font-size: 12px; color: #555;">
          Unfortunately, we are unable to proceed with your <strong>${serviceSubType}</strong> request at this time. 😞
        </p>

        <p style="font-size: 12px; color: #555;">
          If you would like more information about the reason for rejection, or if you'd like to reapply, please don’t hesitate to contact our support team.
        </p>

        <p style="font-size: 12px; color: #555;">
          Reach us at:<br />
          📩 support@connectindia.com | 📞 +91-7898191919
        </p>

        <p style="font-size: 12px; color: #555;">
          We hope to assist you better in the future.
        </p>

        <p style="font-size: 12px; color: #555;">
          Warm regards,<br />
          The Connect India Enterprises Team 🌟
        </p>
      </div>
    `;
  },

  'In Progress': (serviceSubType: string) => {
    return `
      <div >
        <h3 >🔄 Update: Your <strong style="color: #FF9800;">${serviceSubType}</strong> Request is Currently in Progress</h3>

        <p style="font-size: 12px; color: #555;">Hello User,</p>
        <p style="font-size: 12px; color: #555;">Thank you for choosing Connect India Enterprises!</p>
        <p style="font-size: 12px; color: #555;">
          We’re currently processing your <strong>${serviceSubType}</strong> request. Our team is actively working on it and will keep you updated. 🛠️
        </p>

        <p style="font-size: 12px; color: #555;">Here’s what to expect next:</p>
        <ul style="font-size: 12px; color: #555;">
          <li>Progress updates via email.</li>
          <li>Final confirmation once processing is complete.</li>
        </ul>

        <p style="font-size: 12px; color: #555;">
          Check your dashboard for real-time updates:<br />
          <a href="http://localhost:3000/authentication/login" >👉 Login to Dashboard</a>
        </p>

        <p style="font-size: 12px; color: #555;">
          Need help? Reach out to us anytime:<br />
          📩 support@connectindia.com | 📞 +91-7898191919
        </p>

        <p style="font-size: 12px; color: #555;">
          Warm regards,<br />
          The Connect India Enterprises Team 🌟
        </p>
      </div>
    `;
  },

  Pending: (serviceSubType: string) => {
    return `
      <div >
        <h3 >⏳ Update: Your <strong style="color: #FFEB3B;">${serviceSubType}</strong>  Request is Currently Pending</h3>

        <p style="font-size: 12px; color: #555;">Hello User,</p>
        <p style="font-size: 12px; color: #555;">Thank you for choosing Connect India Enterprises.</p>
        <p style="font-size: 12px; color: #555;">
          Your <strong>${serviceSubType}</strong> request is currently under review. We appreciate your patience while we look into the details. 🔍
        </p>

        <p style="font-size: 12px; color: #555;">Here’s what’s happening now:</p>
        <ul style="font-size: 12px; color: #555;">
          <li>Our team is reviewing your submitted information.</li>
          <li>We'll notify you as soon as there's an update.</li>
        </ul>

        <p style="font-size: 12px; color: #555;">
          You can check the status anytime:<br />
          <a href="http://localhost:3000/authentication/login">👉 Login to Dashboard</a>
        </p>

        <p style="font-size: 12px; color: #555;">
          If you have any questions, contact us:<br />
          📩 support@connectindia.com | 📞 +91-7898191919
        </p>

        <p style="font-size: 12px; color: #555;">
          Warm regards,<br />
          The Connect India Enterprises Team 🌟
        </p>
      </div>
    `;
  }
};
