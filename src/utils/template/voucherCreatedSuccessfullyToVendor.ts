export function sendEmailToVendorForVoucherCreated(voucherDetails:any) {
    const validityFrom = voucherDetails.validityFrom.toISOString().split('T')[0]; 
    const validityTo = voucherDetails.validityTo.toISOString().split('T')[0]; 
    return `<div style="line-height: 1.5; font-family: Arial, sans-serif;">

    <h2 style="color:#1c813f;">🎉 Voucher Created Successfully for Your Customer! 🎉</h2>
    
    <p>Dear <strong>${voucherDetails.vendorBusinessRepresentative}</strong>,</p>
    
    <p>Thank you for choosing Connect India Enterprises! We are pleased to inform you that a voucher has been successfully created for your customer. Below are the details:</p>
    
    <h3 style="color:#1c813f;">Voucher Details:</h3>
    <ul>
        <li><strong>Amount:</strong> ₹${voucherDetails.amount}/-</li>
        <li><strong>Validity From:</strong> ${validityFrom}</li>
        <li><strong>Validity To:</strong> ${validityTo}</li>
        <li><strong>Usage:</strong> This voucher is valid for <strong style="color:#1c813f;"> ${voucherDetails.vendorBusinessName} </strong> services only within the mentioned validity period.</li>
    </ul>
    
    <p>We recommend that you inform your customer about the voucher details so they can utilize it within the validity period. If you or your customer have any questions, feel free to reach out to our support team—we’re always happy to assist! 😊</p>
    
    <p><a href="https://connectindiaenterprises.com/">Visit for more information</a></p>
    
    <p>We appreciate your continued partnership and look forward to supporting you with your future business needs. 🌟</p>
    
    <p>Best regards,<br/>The Connect India Enterprises Team 
     <br/>support@connectindiaenterprises.com 
      <br/>+91-7828708020 , +91-8269861090
     🌟</p>

</div>
`;
}



