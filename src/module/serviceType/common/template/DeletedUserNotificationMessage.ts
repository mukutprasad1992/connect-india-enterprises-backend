import { Injectable } from '@nestjs/common';

@Injectable()
export class DeletedServiceRequestNotificationService {
  private template: string = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            padding: 2rem;
            margin: 0;
            color: #343a40;
          }
          .notification-container {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 0.75rem;
            border: 1px solid #dee2e6;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            max-width: 640px;
            width: 100%;
            margin: 0 auto;
          }
          .header {
            font-size: 1.6rem;
            font-weight: 600;
            color: #dc3545;
            text-align: center;
            margin-bottom: 1rem;
          }
          .message-body {
            font-size: 1rem;
            line-height: 1.6;
          }
          .highlight {
            font-weight: bold;
            color: #007bff;
          }
          .footer {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #6c757d;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="notification-container">
          <div class="header">🗑️ Service Request Deleted by User</div>
          <div class="message-body">
            <p>
              The user has deleted their service request for:
              <span class="highlight">{serviceSubType}</span>
            </p>
            <p>
              This request was removed <strong>before any admin action</strong> was taken. It may have been deleted due to a mistake during creation or a change in the user's intent.
            </p>
            <p>
              No further action is required. However, this serves as a record that a request was made and withdrawn by the user.
            </p>
          </div>
          <div class="footer">
            Connect India Enterprises – Service Request Tracker
          </div>
        </div>
      </body>
    </html>
  `;

  getMessage(details: { serviceSubType: string }): string {
    const { serviceSubType = 'Service' } = details;
    return this.template.replace(/{serviceSubType}/g, serviceSubType);
  }
}
