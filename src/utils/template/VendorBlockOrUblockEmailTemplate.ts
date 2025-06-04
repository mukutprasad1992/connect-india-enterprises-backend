import { blockedSubjects, unblockedSubjects } from "../common/common";

export const emailVendorStatusTemplate = {
    VendorStatus: (status: string, businessName: string) => {
        const normalizedStatus = status.trim().toLowerCase();
        const isBlocked = normalizedStatus === 'disable';

        const actionMessage = isBlocked
            ? 'your collaborator account has been <strong style="color: red;">Blocked</strong>'
            : 'your collaborator account has been <strong style="color: green;">Unblocked</strong>';

        const nextSteps = isBlocked
            ? 'If you believe this was a mistake or need assistance, please contact our support team immediately.'
            : 'We’re excited to welcome you back! You may now access all vendor features without restriction.';

        const specialNote = isBlocked
            ? `<p style="font-size: 12px; color: red;">
         ⚠️ Please get in touch with <strong>Connect India Enterprises</strong> to resolve this issue and restore your access.
        </p>`
            : `<p style="font-size: 12px; color: green;">
          Congratulations! Your access has been successfully restored.
        </p>`;

        return `
      <div>
        <p style="font-size: 12px; color: #444;">Hello ${businessName},</p>
        <p style="font-size: 12px; color: #444;">Thank you for being a valued part of Connect India Enterprises.</p>

        <p style="font-size: 12px; color: #444;">
          This is to inform you that ${actionMessage} as part of our platform compliance policy.
        </p>

        ${specialNote}

        <p style="font-size: 12px; color: #444;">
          ${nextSteps}
        </p>

        <p style="font-size: 12px; color: #444;">
          You can track your account and manage your profile anytime:<br />
          <a href="http://13.201.80.65:3000/authentication/login">👉 Login to Dashboard</a>
        </p>

        <p style="font-size: 12px; color: #444;">
          Need help? Reach out to our support team:<br />
          📩 <a href="mailto:support@connectindia.com">support@connectindia.com</a> |
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
