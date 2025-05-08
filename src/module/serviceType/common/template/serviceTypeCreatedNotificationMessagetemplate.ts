import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatedServiceSuccessMessageService {
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
                        border: 1px solid #d1e7f5;
                        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.1);
                        max-width: 640px;
                        width: 100%;
                        margin: 0 auto;
                    }
                    .header {
                        font-size: 1.8rem;
                        font-weight: 700;
                        color: #dc3545;
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
                        color: #28a745;
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
                        📢 A new <span class="highlight">{serviceSubType}</span> service has created by a user and requires your attention.
                    </div>
                    <div class="message-body">
                        <p><strong>Service Type:</strong> <span class="highlight">{serviceSubType}</span></p>
                        <p><strong>Amount:</strong> ₹<span class="highlight">{amount}</span></p>
                        <p><strong>Duration:</strong> {duration}</p>
                        {commentSection}
                        <p><strong>Meeting Time:</strong> {fromTime} to {toTime}</p>
                    </div>
                    <div class="footer">
                        This is an automated alert for administrative review. 🚨
                    </div>
                </div>
            </body>
        </html>
    `;

    getMessageFromCreatedServiceType(details: Record<string, any>): string {
        const {
            serviceSubType = 'Service',
            amount = '0.00',
            duration = 'N/A',
            comment = '',
            fromTime = 'N/A',
            toTime = 'N/A'
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
