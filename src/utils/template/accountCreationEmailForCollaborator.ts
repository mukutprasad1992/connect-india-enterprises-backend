export const collaboratorUserEmailSubject = "Your Account Has Been Created Successfully"

export function getCollaboratorUserCreatedEmailMessage(userId:any, Password:any, businessRepresentative:any ) {
    return `
            <div style="line-height: 1.5;"> 
            
            <h2 style="color:#1c813f;">🎉 Account Created Successfully! 🎉</h2>
            <p>Dear <strong>${businessRepresentative}</strong>,</p>
                
            <p>We are excited to inform you that your account has been successfully created with Connect India Enterprises! 🎉 Welcome aboard! 🙌</p>
                
            <p>Here are your login details:</p>
            <ul>
                <li><strong>User ID:</strong> ${userId}</li>
                <li><strong>Password:</strong> ${Password}</li>
            </ul>
                
            <p><strong>For your security 🔒:</strong> We recommend that you change your password after logging in for the first time to ensure your account remains safe and secure. 🔑</p>
                
            <p>If you need any help or have questions, don’t hesitate to reach out to our support team. We’re here for you 24/7! 💬😊</p>
                
            <p>We look forward to seeing you explore all the great features and services available to you. 🚀</p>

            <a href="https://connectindiaenterprises.com/"> Visit for more information</a>
                
            <p>Best regards,<br/>The Connect India Enterprises Team 🌟</p>

            </div>

        `;
}



