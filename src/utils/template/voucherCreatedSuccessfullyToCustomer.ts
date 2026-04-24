export function sendEmailToCustomerForVoucherCreated(voucherDetails: any) {
  const validityFrom = voucherDetails.validityFrom.toISOString().split('T')[0];
  const validityTo = voucherDetails.validityTo.toISOString().split('T')[0];
  return `<div style="line-height: 1.5; font-family: Arial, sans-serif;">

    <h2 style="color:#1c813f;">🎉 Your Voucher Has Been Created Successfully! 🎉</h2>
    
    <p>Dear <strong>${voucherDetails.customerName}</strong>,</p>
    
    <p>We are excited to inform you that your voucher has been successfully created at Connect India Enterprises.</p>
    
    <h3 style="color:#1c813f;">Voucher Details:</h3>
    <ul>
        <li><strong>Amount:</strong> ₹${voucherDetails.amount}/-</li>
        <li><strong>Validity From:</strong> ${validityFrom}</li>
        <li><strong>Validity To:</strong> ${validityTo}</li>
        <li><strong>Usage:</strong> This voucher is valid for  <strong style="color:#1c813f;">${voucherDetails.vendorBusinessName} </strong>services only within the specified validity period.</li>
    </ul>
    
    <p>Please ensure you use the voucher within the validity period. If you have any questions or need assistance, feel free to reach out to our support team—we’re always here to help! 😊</p>
    
    <p><a href="https://connectindiaenterprises.com/">Visit for more information</a></p>
    
    <p>We value your business and look forward to supporting you as you continue your journey with Connect India Enterprises. 🌟</p>
    
    <p>Best regards,<br/>The Connect India Enterprises Team 
     <br/>support@connectindiaenterprises.com 
      <br/>+91-7828708020 , +91-8269861090
     🌟</p>

</div>
`;
}
