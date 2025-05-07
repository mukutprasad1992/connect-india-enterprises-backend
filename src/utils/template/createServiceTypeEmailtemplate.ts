export const emailCreateServiceTypeTemplates = {
    NewUserRequest: (serviceSubType: string) => {
        return `
      <div style="line-height: 1.6; font-family: Arial, sans-serif; background-color: #f4f7fb; padding: 24px; border-radius: 10px; border: 1px solid #dce3ec;">
        <h2 style="color: #2196F3;">🎉 Welcome to Connect India Enterprises!</h2>

        <p style="font-size: 16px; color: #444;">Thank you for submitting your <strong>${serviceSubType}</strong> service request.</p>
        
        <p style="font-size: 16px; color: #444;">We’re excited to have you with us. Your service request has been successfully created and is currently marked as <strong style="color: #FFA000;">Pending</strong>.</p>

        <p style="font-size: 16px; color: #444;">The Connect India team will reach out to you shortly to discuss your request and guide you through the next steps.</p>
        
        <p style="font-size: 16px; color: #444;">If you have any questions in the meantime, please feel free to contact our support team at:</p>
        
        <ul style="font-size: 16px; color: #444; padding-left: 20px;">
          <li><strong>9039993919</strong></li>
          <li><strong>7898191919</strong></li>
        </ul>

        <p style="font-size: 16px; color: #444;">Warm regards,<br/>
        <strong>Connect India Enterprises Team</strong> 🚀</p>
      </div>
    `;
    }
};
