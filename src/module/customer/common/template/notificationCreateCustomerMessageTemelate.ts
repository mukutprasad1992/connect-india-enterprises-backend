import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationCustomerService {
  async sendCustomerDetailsNotification(customer: any): Promise<string> {
    const message = `
                          <html>
                            <head>
                              <style>
                                body {
                                  font-family: Arial, sans-serif;
                                  line-height: 1.2;
                                  font-size: 14px;
                                  color: #333;
                                }
                                .notification-container {
                                  background-color: #f9f9f9;
                                  padding: 20px;
                                  border-radius: 10px;
                                  border: 1px solid #e0e0e0;
                                  max-width: 600px;
                                  margin: 0 auto;
                                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                                }
                                .header {
                                  font-size: 16px;
                                  font-weight: bold;
                                  color: #007BFF;
                                  text-align: center;
                                  margin-bottom: 20px;
                                }
                                .section {
                                  margin-bottom: 16px;
                                  font-size: 14px;
                                }
                                .section p {
                                  margin: 6px 0;
                                }
                                .label {
                                  font-weight: bold;
                                  color: #555;
                                }
                                .footer {
                                  margin-top: 30px;
                                  font-size: 10px;
                                  color: #999;
                                  text-align: center;
                                }
                              </style>
                            </head>
                            <body>
                              <div class="notification-container">
                                <div class="header">
                                  🎉 New Customer Created for Vendor <span style="color: #007BFF;">${customer.BusinessRepresentative}</span> 🎉
                                </div>
                          
                                <div class="section">
                                  <p><span class="label">Customer Name:</span> ${customer.name}</p>
                                  <p><span class="label">Customer Email:</span> ${customer.email}</p>
                                  <p><span class="label">Customer Phone:</span> ${customer.phone}</p>
                                </div>
                          
                                <div class="section">
                                  <p>✅ The customer has been successfully registered under <strong>${customer.BusinessRepresentative}</strong>.</p>
                                  <p>🚀 Please review the customer's information and take any required actions.</p>
                                  <p>📧 If you need further details, feel free to contact the customer via email or phone.</p>
                                </div>
                          
                                <div class="footer">
                                  © ${new Date().getFullYear()} - Business Name: ${customer.businessName}
                                </div>
                              </div>
                            </body>
                          </html>
                          `;
    return message;
  }
}
