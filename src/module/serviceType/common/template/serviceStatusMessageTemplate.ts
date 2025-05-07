import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageGeneratorService {
    private statusMessages: Record<string, string> = {
        Approved: `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            line-height: 1.6;
                        }
                        .notification-container {
                            background-color: #e9f7ef;
                            padding: 20px;
                            border-radius: 8px;
                            border: 1px solid #d4edda;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .header {
                            font-size: 22px;
                            font-weight: bold;
                            color: #28a745;
                            text-align: center;
                        }
                        .message-body {
                            font-size: 16px;
                            margin-top: 15px;
                        }
                        .highlight {
                            color: green;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 25px;
                            font-size: 14px;
                            color: #6c757d;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="notification-container">
                        <div class="header">
                            🎉 Congratulations! Your <span class="highlight">{serviceSubType}</span> service request has been approved! 🎉
                        </div>
                        <div class="message-body">
                            We’re thrilled to let you know that everything is moving forward. Get ready for the next steps! 🚀
                        </div>
                        <div class="footer">
                            Thank you for your patience! 🙏
                        </div>
                    </div>
                </body>
            </html>
        `,
        Rejected: `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            line-height: 1.6;
                        }
                        .notification-container {
                            background-color: #f8d7da;
                            padding: 20px;
                            border-radius: 8px;
                            border: 1px solid #f5c6cb;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .header {
                            font-size: 22px;
                            font-weight: bold;
                            color: #dc3545;
                            text-align: center;
                        }
                        .message-body {
                            font-size: 16px;
                            margin-top: 15px;
                        }
                        .highlight {
                            color: red;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 25px;
                            font-size: 14px;
                            color: #6c757d;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="notification-container">
                        <div class="header">
                            😞 Sorry! Unfortunately, your <span class="highlight">{serviceSubType}</span> service request has been rejected. 😞
                        </div>
                        <div class="message-body">
                            We understand this might be disappointing, but please don’t hesitate to reach out to us if you'd like more details or need assistance. We're here to help! 💬
                        </div>
                        <div class="footer">
                            Thank you for your understanding. 🙏
                        </div>
                    </div>
                </body>
            </html>
        `,
        'In Progress': `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            line-height: 1.6;
                        }
                        .notification-container {
                            background-color: #fff3cd;
                            padding: 20px;
                            border-radius: 8px;
                            border: 1px solid #ffeeba;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .header {
                            font-size: 22px;
                            font-weight: bold;
                            color: #ffc107;
                            text-align: center;
                        }
                        .message-body {
                            font-size: 16px;
                            margin-top: 15px;
                        }
                        .highlight {
                            color: orange;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 25px;
                            font-size: 14px;
                            color: #6c757d;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="notification-container">
                        <div class="header">
                            🔧 It’s Happening! Your <span class="highlight">{serviceSubType}</span> service request is in progress! 🔧
                        </div>
                        <div class="message-body">
                            We’re making sure everything is taken care of, and we’ll keep you updated as we move along. Stay tuned! 📩
                        </div>
                        <div class="footer">
                            Thank you for your patience! 🙏
                        </div>
                    </div>
                </body>
            </html>
        `,
        Pending: `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            line-height: 1.6;
                        }
                        .notification-container {
                            background-color: #cce5ff;
                            padding: 20px;
                            border-radius: 8px;
                            border: 1px solid #b8daff;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .header {
                            font-size: 22px;
                            font-weight: bold;
                            color: #007bff;
                            text-align: center;
                        }
                        .message-body {
                            font-size: 16px;
                            margin-top: 15px;
                        }
                        .highlight {
                            color: blue;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 25px;
                            font-size: 14px;
                            color: #6c757d;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="notification-container">
                        <div class="header">
                            🕒 Request Pending. Your <span class="highlight">{serviceSubType}</span> service request is pending! 🕒
                        </div>
                        <div class="message-body">
                            It’s currently under review. We’ll notify you as soon as it’s processed or if we need any additional details from you. Thanks for your patience! 🙏
                        </div>
                        <div class="footer">
                            Thank you for your understanding! 🙏
                        </div>
                    </div>
                </body>
            </html>
        `
    };

    getStatusMessage(status: string, serviceSubType: string): string {
        const formattedStatus = status.trim();
        let message = this.statusMessages[formattedStatus] || `ℹ️ Your service request status: ${status}`;
        return message.replace("{serviceSubType}", `<span class="highlight">${serviceSubType}</span>`);
    }
}
