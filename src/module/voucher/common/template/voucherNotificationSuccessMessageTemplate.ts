import { Injectable } from '@nestjs/common';

@Injectable()
export class SuccessVoucherMessageService {
  private statusMessages: Record<string, string> = {
    CouponGenerated: `
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
                            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
                            max-width: 640px;
                            width: 100%;
                            margin: 0 auto;
                        }
                        .header {
                            font-size: 1.9rem;
                            font-weight: 700;
                            color: #007bff;
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
                            color: #007bff;
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
                                font-size: 1.6rem;
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
                            🎉 Hey <span class="highlight">{vendorName}</span>! 🎉<br/>
                            A new coupon has just been generated!
                        </div>
                        <div class="message-body">
                            <p><strong>Issued for </strong><span class="highlight">{customerName}</span>.</p>
                            <p><strong>Voucher Code:</strong> <span class="highlight">{voucherCode}</span></p>
                            <p><strong>Amount:</strong> ₹<span class="highlight">{amount}</span></p>
                            <p><strong>Valid From:</strong> {validityFrom}</p>
                            <p><strong>Valid To:</strong> {validityTo}</p>
                            <p>This voucher is redeemable at your store 🛍️, so get ready to welcome the customer with a smile 😊!</p>
                        </div>
                        <div class="footer">
                            Thanks for partnering with us! 🌟
                        </div>
                    </div>
                </body>
            </html>
        `,
  };

  getCouponGeneratedMessage(voucherDetails: {
    vendorBusinessRepresentative?: string;
    vendorBusinessName?: string;
    customerName: string;
    amount: string;
    voucherCode: string;
    validityFrom: string;
    validityTo: string;
  }): string {
    const vendorName =
      voucherDetails.vendorBusinessName ||
      voucherDetails.vendorBusinessRepresentative ||
      'Partner';
    const customerName = voucherDetails.customerName || 'a customer';
    const amount = voucherDetails.amount || '0.00';
    const voucherCode = voucherDetails.voucherCode || 'N/A';

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'N/A' : date.toDateString();
    };

    const validityFrom = formatDate(voucherDetails.validityFrom);
    const validityTo = formatDate(voucherDetails.validityTo);

    return this.statusMessages['CouponGenerated']
      .replace('{vendorName}', vendorName)
      .replace('{customerName}', customerName)
      .replace('{voucherCode}', voucherCode)
      .replace('{amount}', amount)
      .replace('{validityFrom}', validityFrom)
      .replace('{validityTo}', validityTo);
  }
}
