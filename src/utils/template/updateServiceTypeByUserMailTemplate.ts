export const emailUpdateServiceTypeTemplates = {
  UpdateUserRequest: (serviceSubType: string, status: string = 'Updated') => {
    return `
      <div>
        <h3>Your ${serviceSubType} Request Has Been Updated!</h3>

        <p style="font-size: 12px; color: #444;">Hello User,</p>
        <p style="font-size: 12px; color: #444;">Thank you for updating your request with Connect India Enterprises!</p>
        
        <p style="font-size: 12px; color: #444;">
          Your request for <strong>${serviceSubType}</strong> has been successfully updated and is now marked as <strong>${status}</strong>.
        </p>

        <p style="font-size: 12px; color: #444;">
          Here's what you should know about your update:
        </p>

        <ul style="font-size: 12px; color: #444; padding-left: 20px;">
          <li>Your changes have been received by our system</li>
          <li>If your update requires review, our team will verify the changes</li>
          <li>You'll receive another notification once processing continues</li>
        </ul>

        <p style="font-size: 12px; color: #444;">
          You can review your updated request and track progress:<br />
          <a href="http://13.201.80.65:3000/authentication/login">👉 Login to Dashboard</a>
        </p>

        <p style="font-size: 12px; color: #444;">
          Need to make more changes or have questions?<br />
          Our support team is happy to help:<br />
          📞 <strong>9039993919</strong> | <strong>7898191919</strong>
        </p>

        <p style="font-size: 12px; color: #444;">
          Warm regards,<br/>
          <strong>The Connect India Enterprises Team</strong> 🌟<br/>
          Helping you connect with better opportunities.
        </p>
      </div>
    `;
  },
};
