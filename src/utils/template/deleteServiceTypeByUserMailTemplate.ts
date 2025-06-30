export const emailDeleteServiceTypeTemplates = {
    NewUserRequest: (serviceSubType: string) => { /* ... */ },

    ServiceTypeDeleted: (serviceSubType: string) => {
        return `
        <div>
          <h3>Notice: ${serviceSubType} Request Removed</h3>
  
          <p style="font-size: 12px; color: #444;">Hello User,</p>
  
          <p style="font-size: 12px; color: #444;">
            We wanted to inform you that your <strong>${serviceSubType}</strong> service request has been <strong>deleted</strong> from our system.
          </p>
  
          <p style="font-size: 12px; color: #444;">
            If this action was performed by you, no further steps are required.
            However, if you did not initiate this change, please contact our support team immediately to ensure the security of your account.
          </p>
  
          <p style="font-size: 12px; color: #444;">
            You may submit a new request anytime via your dashboard:<br/>
            <a href="http://13.201.80.65:3000/authentication/login">👉 Login to Dashboard</a>
          </p>
  
          <p style="font-size: 12px; color: #444;">
            For assistance, feel free to contact:<br/>
            📞 <strong>9039993919</strong> | <strong>7898191919</strong>
          </p>
  
          <p style="font-size: 12px; color: #444;">
            Thank you for choosing Connect India Enterprises.<br/>
            <strong>The Connect India Team</strong>
          </p>
        </div>
      `;
    }
};
