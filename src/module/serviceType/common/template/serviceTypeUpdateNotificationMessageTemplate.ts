import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdatedServiceMessageService {
  private template: string = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            padding: 2rem;
            margin: 0;
            color: #333;
          }
          .notification-container {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 0.75rem;
            border: 1px solid #ffc107;
            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
            max-width: 640px;
            width: 100%;
            margin: 0 auto;
          }
          .header {
            font-size: 1.8rem;
            font-weight: 700;
            color: #fd7e14;
            text-align: center;
            margin-bottom: 1.2rem;
            line-height: 2.4rem;
          }
          .message-body {
            font-size: 1rem;
            line-height: 1.75;
            text-align: left;
          }
          .highlight {
            color: #17a2b8;
            font-weight: bold;
          }
          .footer {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #6c757d;
            text-align: center;
          }
          @media (max-width: 480px) {
            .notification-container {
              padding: 1.5rem;
            }
            .header {
              font-size: 1.5rem;
              line-height: 2rem;
            }
            .message-body {
              font-size: 0.95rem;
            }
            .footer {
              font-size: 0.85rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="notification-container">
          <div class="header">
            🔄 A <span class="highlight">{serviceSubType}</span> service request has been updated by the user.
          </div>
          <div class="message-body">
            <p><strong>Service Type:</strong> <span class="highlight">{serviceSubType}</span></p>
            <p><strong>Updated Amount:</strong> ₹<span class="highlight">{amount}</span></p>
            <p><strong>Duration:</strong> {duration}</p>
            {commentSection}
            <p><strong>Updated Meeting Time:</strong> {fromTime} to {toTime}</p>
          </div>
          <div class="footer">
            Please review the updated request for further action. 🚨
          </div>
        </div>
      </body>
    </html>
  `;

  getMessageFromUpdatedService(details: Record<string, any>): string {
    const {
      serviceSubType = 'Service',
      amount = '0.00',
      duration = 'N/A',
      comment = '',
      fromTime = 'N/A',
      toTime = 'N/A',
    } = details;

    const commentSection = comment
      ? `<p><strong>Comment:</strong> ${comment}</p>`
      : '';

    return this.template
      .replace(/{serviceSubType}/g, serviceSubType)
      .replace('{amount}', amount)
      .replace('{duration}', duration)
      .replace('{fromTime}', fromTime)
      .replace('{toTime}', toTime)
      .replace('{commentSection}', commentSection);
  }
}
