import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateNotificationCustomerService {
    async sendCustomerDetailsNotification(customer: any): Promise<string> {
        const message = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                font-size: 14px;
                color: #333;
              }
              .notification-container {
                background-color: #f4f6f8;
                padding: 24px;
                border-radius: 8px;
                border: 1px solid #dcdcdc;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
              }
              .header {
                font-size: 18px;
                font-weight: bold;
                color: #2c7be5;
                text-align: center;
                margin-bottom: 24px;
              }
              .section {
                margin-bottom: 20px;
              }
              .section p {
                margin: 8px 0;
              }
              .label {
                font-weight: bold;
                color: #444;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #888;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="notification-container">
              <div class="header">
                🔄 Customer Details Updated by Vendor <span style="color: #2c7be5;">${customer.BusinessRepresentative}</span>
              </div>

              <div class="section">
                <p><span class="label">Customer Name:</span> ${customer.name}</p>
                <p><span class="label">Updated Email:</span> ${customer.email}</p>
                <p><span class="label">Updated Phone:</span> ${customer.phone}</p>
              </div>

              <div class="section">
                <p>✏️ The customer's information has been successfully updated by <strong>${customer.BusinessRepresentative}</strong>.</p>
                <p>🔍 Please review the latest customer details for accuracy and take further action if necessary.</p>
                <p>📧 For follow-up, feel free to contact the customer directly using the provided information.</p>
              </div>

              <div class="footer">
                &copy; ${new Date().getFullYear()} | ${customer.businessName}. All rights reserved.
              </div>
            </div>
          </body>
        </html>
        `;
        return message;
    }
}
