export const emailTemplates = {
    Approved: (serviceSubType: string) => {
        return `
      <div style="line-height: 1.6; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4CAF50;">🎉 Congratulations! Your ${serviceSubType} has been Approved 🎉</h2>

        <p style="font-size: 16px; color: #555;">We are excited to inform you that your <strong>${serviceSubType}</strong> request has been approved! 🎉</p>
        <p style="font-size: 16px; color: #555;">Your service has been processed successfully, and we look forward to moving ahead with the next steps.</p>
        <p style="font-size: 16px; color: #555;">If you have any questions or need further assistance, please feel free to contact us. We're always happy to help! 😊</p>
        <p style="font-size: 16px; color: #555;">Thank you for choosing Connect India Enterprises!</p>
        <p style="font-size: 16px; color: #555;">Best regards,<br/>Connect India Enterprises 🚀</p>
      </div>
    `;
    },

    Rejected: (serviceSubType: string) => {
        return `
      <div style="line-height: 1.6; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #E53935;">❌ Unfortunately, Your ${serviceSubType} Request has been Rejected ❌</h2>

        <p style="font-size: 16px; color: #555;">We regret to inform you that your <strong>${serviceSubType}</strong> request has been rejected. 😞</p>
        <p style="font-size: 16px; color: #555;">For more information or clarification, please feel free to get in touch with us. We're here to assist you with any questions you may have.</p>
        <p style="font-size: 16px; color: #555;">We hope to serve you better in the future!</p>
        <p style="font-size: 16px; color: #555;">Best regards,<br/>Connect India Enterprises 🚀</p>
      </div>
    `;
    },

    'In Progress': (serviceSubType: string) => {
        return `
      <div style="line-height: 1.6; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #FF9800;">🔄 Your ${serviceSubType} Request is In Progress 🔄</h2>

        <p style="font-size: 16px; color: #555;">We are currently processing your <strong>${serviceSubType}</strong> request. 🚀</p>
        <p style="font-size: 16px; color: #555;">Our team is actively working on it and will notify you as soon as the task is completed. Thank you for your patience! 🙏</p>
        <p style="font-size: 16px; color: #555;">If you have any questions or require additional information, please don’t hesitate to contact us.</p>
        <p style="font-size: 16px; color: #555;">Best regards,<br/>Connect India Enterprises 🚀</p>
      </div>
    `;
    },

    Pending: (serviceSubType: string) => {
        return `
      <div style="line-height: 1.6; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #FFEB3B;">⏳ Your ${serviceSubType} Request is Pending ⏳</h2>

        <p style="font-size: 16px; color: #555;">Your <strong>${serviceSubType}</strong> request is currently pending. 🕑</p>
        <p style="font-size: 16px; color: #555;">We are reviewing your request and will update you as soon as there is any progress. Thank you for your patience and understanding.</p>
        <p style="font-size: 16px; color: #555;">If you have any questions or would like to follow up, please reach out to our support team. We are happy to assist you! 😊</p>
        <p style="font-size: 16px; color: #555;">Best regards,<br/>Connect India Enterprises 🚀</p>
      </div>
    `;
    },
};
