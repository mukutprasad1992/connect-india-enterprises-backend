export const emailCreateServiceTypeTemplates = {
  NewUserRequest: (serviceSubType: string) => {
    return `
      <div>
        <h3 >Received Your ${serviceSubType} Request!</h3>

        <p style="font-size: 12px; color: #444;">Hello User      ,</p>
        <p style="font-size: 12px; color: #444;">Thank you for choosing Connect India Enterprises!</p>
        
        <p style="font-size: 12px; color: #444;">
          Your request for <strong>${serviceSubType}</strong> has been successfully submitted and is currently marked as <strong>Pending</strong>.
        </p>

        <p style="font-size: 12px; color: #444;">
          Our team is reviewing your details and will reach out within 24–48 hours to guide you through the next steps. Here's what happens next:
        </p>

        <ul style="font-size: 12px; color: #444; padding-left: 20px;">
          <li>Personalized guidance from our team.</li>
          <li>Next steps for processing your service.</li>
          <li>Continued support throughout the journey.</li>
        </ul>

        <p style="font-size: 12px; color: #444;">
          You can track your request and manage your profile anytime:<br />
          <a href="http://13.201.80.65:3000/authentication/login" >👉 Login to Dashboard</a>
        </p>

        <p style="font-size: 12px; color: #444;">
          Need help? Reach out to our support team:<br />
          📞 <strong>9039993919</strong> | <strong>7898191919</strong>
        </p>

        <p style="font-size: 12px; color: #444;">
          Warm regards,<br/>
          <strong>The Connect India Enterprises Team</strong> 🌟<br/>
          Helping you connect with better opportunities.
        </p>
      </div>
    `;
  }
};
