
// ====================
// EMAIL SERVICE CONFIGURATION
// ====================

const nodemailer = require('nodemailer');

// Configure email transporter (using Gmail as example)
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    // service: 'gmail', // or your email provider
    // auth: {
    //   user: process.env.EMAIL_USER, // your email
    //   pass: process.env.EMAIL_APP_PASSWORD // app-specific password
    // },
    // Alternative SMTP configuration:
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Email template for successful user creation
const createUserCreationEmailTemplate = (userData) => {
  const {
    firstName,
    lastName,
    username,
    email,
    phone,
    temporaryPassword, // Temporary password
    role,
    organization,
    loginUrl = process.env.FRONTEND_URL + "/login"
  } = userData;

  return {
    subject: `Welcome to Admin Panel - Your Account Has Been Created`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Admin Panel</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #f8fafc;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          
          .header h1 {
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 700;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .welcome-message {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .welcome-message h2 {
            color: #667eea;
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          .welcome-message p {
            color: #64748b;
            font-size: 16px;
          }
          
          .user-details {
            background: rgba(102, 126, 234, 0.05);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #667eea;
          }
          
          .user-details h3 {
            color: #667eea;
            font-size: 18px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(102, 126, 234, 0.1);
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 600;
            color: #2c3e50;
            min-width: 120px;
          }
          
          .detail-value {
            color: #64748b;
            text-align: right;
            font-family: 'Monaco', 'Menlo', monospace;
          }
          
          .credentials-box {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
            border: 2px solid #faad14;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
          }
          
          .credentials-box h3 {
            color: #faad14;
            font-size: 18px;
            margin-bottom: 16px;
          }
          
          .credential-item {
            margin: 12px 0;
            padding: 12px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            border: 1px solid rgba(255, 193, 7, 0.3);
          }
          
          .credential-label {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 4px;
          }
          
          .credential-value {
            font-size: 16px;
            font-weight: 700;
            color: #2c3e50;
            font-family: 'Monaco', 'Menlo', monospace;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            transition: transform 0.2s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            color: white;
            text-decoration: none;
          }
          
          .security-notice {
            background: rgba(255, 77, 79, 0.1);
            border: 1px solid #ff4d4f;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          
          .security-notice h4 {
            color: #ff4d4f;
            margin-bottom: 8px;
            font-size: 16px;
          }
          
          .security-notice p {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
          }
          
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
          }
          
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 24px 0;
          }
          
          @media (max-width: 600px) {
            .email-container {
              margin: 0;
              border-radius: 0;
            }
            
            .header, .content, .footer {
              padding: 24px 20px;
            }
            
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            
            .detail-value {
              text-align: left;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="logo">A</div>
            <h1>Admin Panel</h1>
            <p>Your account has been successfully created</p>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <div class="welcome-message">
              <h2>Welcome, ${firstName} ${lastName}!</h2>
              <p>Your admin account has been created and is ready to use.</p>
            </div>
            
            <!-- User Details -->
            <div class="user-details">
              <h3>📋 Account Information</h3>
              <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${firstName} ${lastName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Username:</span>
                <span class="detail-value">@${username}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${phone}</span>
              </div>
              ${role ? `
              <div class="detail-row">
                <span class="detail-label">Role:</span>
                <span class="detail-value">${role.name}</span>
              </div>
              ` : ''}
              ${organization ? `
              <div class="detail-row">
                <span class="detail-label">Organization:</span>
                <span class="detail-value">${organization.name}</span>
              </div>
              ` : ''}
            </div>
            
            <!-- Login Credentials -->
            <div class="credentials-box">
              <h3>🔐 Your Login Credentials</h3>
              <div class="credential-item">
                <div class="credential-label">Username</div>
                <div class="credential-value">${username}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">Temporary Password</div>
                <div class="credential-value">${temporaryPassword}</div>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center;">
              <a href="${loginUrl}" class="cta-button">
                🚀 Login to Your Account
              </a>
            </div>
            
            <!-- Security Notice -->
            <div class="security-notice">
              <h4>🛡️ Important Security Notice</h4>
              <p>• Please change your password immediately after your first login</p>
              <p>• Keep your login credentials secure and don't share them with anyone</p>
              <p>• Complete your account setup process as prompted</p>
              <p>• Contact support if you experience any issues accessing your account</p>
            </div>
            
            <div class="divider"></div>
            
            <!-- Next Steps -->
            <div style="text-align: center; margin: 24px 0;">
              <h3 style="color: #667eea; margin-bottom: 16px;">What's Next?</h3>
              <p style="color: #64748b; margin-bottom: 8px;">1. Click the login button above to access your account</p>
              <p style="color: #64748b; margin-bottom: 8px;">2. Change your temporary password</p>
              <p style="color: #64748b; margin-bottom: 8px;">3. Complete your profile setup</p>
              <p style="color: #64748b;">4. Start managing your assigned tasks and permissions</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>If you have any questions or need assistance, please contact our support team:</p>
            <p>📧 <a href="mailto:support@yourcompany.com">support@yourcompany.com</a></p>
            <p>📞 +1 (555) 123-4567</p>
            <div class="divider"></div>
            <p style="font-size: 12px; color: #94a3b8;">
              This email was sent automatically. Please do not reply to this email address.
            </p>
            <p style="font-size: 12px; color: #94a3b8;">
              © 2024 Your Company Name. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Admin Panel!

Hi ${firstName} ${lastName},

Your admin account has been successfully created. Here are your account details:

Account Information:
- Full Name: ${firstName} ${lastName}
- Username: @${username}
- Email: ${email}
- Phone: ${phone}
${role ? `- Role: ${role.name}` : ''}
${organization ? `- Organization: ${organization.name}` : ''}

Login Credentials:
- Username: ${username}
- Temporary Password: ${temporaryPassword}

Login URL: ${loginUrl}

IMPORTANT SECURITY NOTICE:
- Please change your password immediately after your first login
- Keep your login credentials secure and don't share them with anyone
- Complete your account setup process as prompted

What's Next?
1. Visit the login URL above to access your account
2. Change your temporary password
3. Complete your profile setup
4. Start managing your assigned tasks and permissions

Need Help?
Contact our support team:
Email: support@yourcompany.com
Phone: +1 (555) 123-4567

Best regards,
Admin Panel Team
    `
  };
};

// ====================
// EMAIL SENDING FUNCTION
// ====================

const sendUserCreationEmail = async (userData) => {
  try {
    const transporter = createEmailTransporter();
    const emailTemplate = createUserCreationEmailTemplate(userData);

    const mailOptions = {
      from: {
        name: 'Admin Panel',
        address: process.env.EMAIL_USER
      },
      to: userData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      // Optional: Add high priority
      priority: 'high',
      // Optional: Request delivery receipt
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('✅ User creation email sent successfully:', {
      messageId: result.messageId,
      to: userData.email,
      username: userData.username
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('❌ Failed to send user creation email:', error);

    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};


// Email template for password setup
const createPasswordSetupEmailTemplate = (userData) => {
  const {
    firstName,
    lastName,
    username,
    email,
    setupToken, // Secure token for password setup
    setupUrl, // Complete URL with token for password setup
    expirationTime = '24 hours', // Token expiration time
    role,
    organization,
    isFirstTimeSetup = true, // Whether this is initial setup or reset
    supportEmail = process.env.SUPPORT_EMAIL || 'support@yourcompany.com',
    supportPhone = process.env.SUPPORT_PHONE || '+1 (555) 123-4567'
  } = userData;

  const setupType = isFirstTimeSetup ? 'Set Up' : 'Reset';
  const actionText = isFirstTimeSetup ? 'set up your password' : 'reset your password';

  return {
    subject: `${setupType} Your Password - Action Required`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${setupType} Your Password</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #f8fafc;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          
          .header h1 {
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 700;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .welcome-message {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .welcome-message h2 {
            color: #10b981;
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          .welcome-message p {
            color: #64748b;
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          .user-details {
            background: rgba(16, 185, 129, 0.05);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #10b981;
          }
          
          .user-details h3 {
            color: #10b981;
            font-size: 18px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(16, 185, 129, 0.1);
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 600;
            color: #2c3e50;
            min-width: 120px;
          }
          
          .detail-value {
            color: #64748b;
            text-align: right;
            font-family: 'Monaco', 'Menlo', monospace;
          }
          
          .password-setup-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 32px 24px;
            margin: 32px 0;
            text-align: center;
          }
          
          .password-setup-box h3 {
            color: #10b981;
            font-size: 20px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          
          .password-setup-box p {
            color: #64748b;
            margin-bottom: 24px;
            font-size: 16px;
          }
          
          .setup-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 18px 36px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 16px;
            text-align: center;
            margin: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            border: none;
            cursor: pointer;
          }
          
          .setup-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            color: white;
            text-decoration: none;
          }
          
          .token-info {
            background: rgba(245, 158, 11, 0.05);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          
          .token-info h4 {
            color: #f59e0b;
            margin-bottom: 8px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .token-info p {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
          }
          
          .security-notice {
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          
          .security-notice h4 {
            color: #3b82f6;
            margin-bottom: 12px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .security-notice ul {
            color: #64748b;
            padding-left: 20px;
            margin: 8px 0;
          }
          
          .security-notice li {
            margin: 6px 0;
            font-size: 14px;
          }
          
          .alternative-access {
            background: rgba(100, 116, 139, 0.05);
            border: 1px solid #64748b;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            text-align: center;
          }
          
          .alternative-access h4 {
            color: #64748b;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .alternative-access p {
            color: #64748b;
            font-size: 12px;
            font-family: 'Monaco', 'Menlo', monospace;
            word-break: break-all;
            background: rgba(255, 255, 255, 0.8);
            padding: 8px;
            border-radius: 4px;
            margin: 8px 0;
          }
          
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
          }
          
          .footer a {
            color: #10b981;
            text-decoration: none;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 24px 0;
          }
          
          @media (max-width: 600px) {
            .email-container {
              margin: 0;
              border-radius: 0;
            }
            
            .header, .content, .footer {
              padding: 24px 20px;
            }
            
            .password-setup-box {
              padding: 24px 16px;
            }
            
            .setup-button {
              display: block;
              margin: 16px 0;
              padding: 16px 24px;
            }
            
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            
            .detail-value {
              text-align: left;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="logo">🔐</div>
            <h1>${setupType} Your Password</h1>
            <p>Secure your account with a strong password</p>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <div class="welcome-message">
              <h2>Hello ${firstName} ${lastName}!</h2>
              <p>You need to ${actionText} to complete your account setup.</p>
              <p>Click the button below to get started.</p>
            </div>
            
            <!-- User Details -->
            <div class="user-details">
              <h3>👤 Account Information</h3>
              <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${firstName} ${lastName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Username:</span>
                <span class="detail-value">@${username}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${email}</span>
              </div>
              ${role ? `
              <div class="detail-row">
                <span class="detail-label">Role:</span>
                <span class="detail-value">${role.name}</span>
              </div>
              ` : ''}
              ${organization ? `
              <div class="detail-row">
                <span class="detail-label">Organization:</span>
                <span class="detail-value">${organization.name}</span>
              </div>
              ` : ''}
            </div>
            
            <!-- Password Setup Section -->
            <div class="password-setup-box">
              <h3>🚀 ${setupType} Your Password</h3>
              <p>Click the button below to ${actionText} and secure your account. This link is valid for ${expirationTime}.</p>
              
              <a href="${setupUrl}" class="setup-button">
                ${setupType} Password Now
              </a>
            </div>
            
            <!-- Token Expiration Info -->
            <div class="token-info">
              <h4>⏰ Important Timing Information</h4>
              <p><strong>Link expires in:</strong> ${expirationTime}</p>
              <p>After expiration, you'll need to request a new password ${isFirstTimeSetup ? 'setup' : 'reset'} link.</p>
              <p>For security reasons, this link can only be used once.</p>
            </div>
            
            <!-- Security Guidelines -->
            <div class="security-notice">
              <h4>🛡️ Password Security Guidelines</h4>
              <ul>
                <li>Use at least 8 characters (12+ recommended)</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Add numbers and special characters</li>
                <li>Avoid common words or personal information</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
            
            <!-- Alternative Access -->
            <div class="alternative-access">
              <h4>Can't click the button? Copy this link:</h4>
              <p>${setupUrl}</p>
            </div>
            
            <div class="divider"></div>
            
            <!-- Next Steps -->
            <div style="text-align: center; margin: 24px 0;">
              <h3 style="color: #10b981; margin-bottom: 16px;">What Happens Next?</h3>
              <p style="color: #64748b; margin-bottom: 8px;">1. Click the "${setupType} Password Now" button</p>
              <p style="color: #64748b; margin-bottom: 8px;">2. Create a strong, secure password</p>
              <p style="color: #64748b; margin-bottom: 8px;">3. Confirm your new password</p>
              <p style="color: #64748b; margin-bottom: 8px;">4. ${isFirstTimeSetup ? 'Complete your account setup' : 'Login with your new password'}</p>
              <p style="color: #64748b;">5. Start using your account!</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>If you're having trouble with password setup or didn't request this change:</p>
            <p>📧 <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            <p>📞 ${supportPhone}</p>
            <div class="divider"></div>
            <p style="font-size: 12px; color: #94a3b8;">
              This email was sent for security purposes. If you didn't request this, please contact support immediately.
            </p>
            <p style="font-size: 12px; color: #94a3b8;">
              © 2024 Your Company Name. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${setupType} Your Password - Action Required

Hello ${firstName} ${lastName}!

You need to ${actionText} to complete your account setup.

Account Information:
- Full Name: ${firstName} ${lastName}
- Username: @${username}
- Email: ${email}
${role ? `- Role: ${role.name}` : ''}
${organization ? `- Organization: ${organization.name}` : ''}

PASSWORD SETUP LINK:
${setupUrl}

IMPORTANT TIMING INFORMATION:
- Link expires in: ${expirationTime}
- After expiration, you'll need to request a new password ${isFirstTimeSetup ? 'setup' : 'reset'} link
- For security reasons, this link can only be used once

PASSWORD SECURITY GUIDELINES:
- Use at least 8 characters (12+ recommended)
- Include uppercase and lowercase letters
- Add numbers and special characters
- Avoid common words or personal information
- Don't reuse passwords from other accounts
- Consider using a password manager

What Happens Next?
1. Click the password setup link above
2. Create a strong, secure password
3. Confirm your new password
4. ${isFirstTimeSetup ? 'Complete your account setup' : 'Login with your new password'}
5. Start using your account!

Need Help?
If you're having trouble with password setup or didn't request this change:
Email: ${supportEmail}
Phone: ${supportPhone}

This email was sent for security purposes. If you didn't request this, please contact support immediately.

Best regards,
Security Team
    `
  };
};

// ====================
// EMAIL SENDING FUNCTION
// ====================

const sendPasswordSetupEmail = async (userData) => {
  try {
    const transporter = createEmailTransporter();
    const emailTemplate = createPasswordSetupEmailTemplate(userData);

    const mailOptions = {
      from: {
        name: 'Security Team',
        address: process.env.EMAIL_USER
      },
      to: userData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Category': 'password-setup'
      }
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('✅ Password setup email sent successfully:', {
      messageId: result.messageId,
      to: userData.email,
      username: userData.username,
      setupType: userData.isFirstTimeSetup ? 'setup' : 'reset'
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Password setup email sent successfully'
    };

  } catch (error) {
    console.error('❌ Failed to send password setup email:', error);

    return {
      success: false,
      error: error.message,
      message: 'Failed to send password setup email'
    };
  }
};

// ====================
// USAGE EXAMPLES
// ====================

// Example 1: First-time password setup
/*
const newUserData = {
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "john@example.com",
  setupToken: "abc123def456ghi789", // Generated secure token
  setupUrl: "https://yourapp.com/setup-password?token=abc123def456ghi789",
  expirationTime: "24 hours",
  role: { name: "Admin" },
  organization: { name: "Tech Corp" },
  isFirstTimeSetup: true
};

await sendPasswordSetupEmail(newUserData);
*/

// Example 2: Password reset
/*
const resetUserData = {
  firstName: "Jane",
  lastName: "Smith",
  username: "janesmith",
  email: "jane@example.com",
  setupToken: "xyz789uvw456rst123",
  setupUrl: "https://yourapp.com/reset-password?token=xyz789uvw456rst123",
  expirationTime: "1 hour",
  isFirstTimeSetup: false // This is a password reset
};

await sendPasswordSetupEmail(resetUserData);
*/

// Email template for organization registration rejection
const createOrganizationRejectionEmailTemplate = (rejectionData) => {
  const {
    organizationName,
    contactName,
    contactEmail,
    submissionDate,
    reason, // Main rejection reason key
    additionalNotes = '', // Optional additional explanation
    supportEmail = process.env.SUPPORT_EMAIL || 'support@yourcompany.com',
    supportPhone = process.env.SUPPORT_PHONE || '+1 (555) 123-4567',
    guidelinesUrl = process.env.FRONTEND_URL + '/organizer-guidelines',
    reapplicationAllowed = true, // Whether they can reapply
    reapplicationPeriod = '30 days' // Waiting period before reapplication
  } = rejectionData;

  // Define rejection reasons with detailed explanations
  const rejectionReasons = {
    'incomplete_documentation': {
      title: 'Incomplete Documentation',
      description: 'Required documentation or information is missing from your application.',
      details: 'Please ensure all required documents, certificates, and forms are properly submitted and complete.'
    },
    'verification_failed': {
      title: 'Verification Process Failed',
      description: 'We were unable to verify your organization\'s credentials or legal status.',
      details: 'Please provide valid business registration, tax documents, or other required verification materials.'
    },
    'insufficient_experience': {
      title: 'Insufficient Experience',
      description: 'Your organization does not meet our minimum experience requirements.',
      details: 'We require organizers to have demonstrable experience in event management or related fields.'
    },
    'policy_compliance': {
      title: 'Policy Compliance Issues',
      description: 'Your organization or application does not meet our platform policies.',
      details: 'Please review our organizer guidelines and ensure full compliance with all requirements.'
    },
    'financial_requirements': {
      title: 'Financial Requirements Not Met',
      description: 'Your organization does not meet our financial stability or insurance requirements.',
      details: 'Valid business insurance, financial statements, or bonding may be required for approval.'
    },
    'capacity_concerns': {
      title: 'Capacity and Resource Concerns',
      description: 'We have concerns about your organization\'s capacity to manage events effectively.',
      details: 'This may include staffing, technical capabilities, or operational infrastructure concerns.'
    },
    'reputation_issues': {
      title: 'Reputation or Background Issues',
      description: 'Background checks or reputation research raised concerns about your organization.',
      details: 'This decision is based on our due diligence process and platform safety requirements.'
    },
    'market_saturation': {
      title: 'Market Saturation',
      description: 'We currently have sufficient organizers in your category or geographic area.',
      details: 'We may reconsider your application when market conditions change or demand increases.'
    },
    'application_quality': {
      title: 'Application Quality Issues',
      description: 'Your application did not meet our quality standards or was incomplete.',
      details: 'Please provide more detailed information about your organization, experience, and event planning capabilities.'
    },
    'other': {
      title: 'Other Reason',
      description: 'Your application was rejected for reasons not covered by standard categories.',
      details: 'Please see additional notes below or contact support for more information.'
    }
  };

  const selectedReason = rejectionReasons[reason] || rejectionReasons['other'];

  return {
    subject: `Organization Registration Application - Decision Notification`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organization Registration Decision</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #f8fafc;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          
          .header h1 {
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 700;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .rejection-message {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .rejection-message h2 {
            color: #ef4444;
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          .rejection-message p {
            color: #64748b;
            font-size: 16px;
          }
          
          .application-details {
            background: rgba(239, 68, 68, 0.05);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #ef4444;
          }
          
          .application-details h3 {
            color: #ef4444;
            font-size: 18px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(239, 68, 68, 0.1);
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 600;
            color: #2c3e50;
            min-width: 140px;
          }
          
          .detail-value {
            color: #64748b;
            text-align: right;
          }
          
          .rejection-reason {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
            border: 2px solid #ef4444;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .rejection-reason h3 {
            color: #ef4444;
            font-size: 18px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
          }
          
          .rejection-reason h4 {
            color: #dc2626;
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          .rejection-reason p {
            color: #64748b;
            margin-bottom: 8px;
          }
          
          .additional-notes {
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          
          .additional-notes h4 {
            color: #3b82f6;
            margin-bottom: 8px;
            font-size: 16px;
          }
          
          .additional-notes p {
            color: #64748b;
            font-size: 14px;
          }
          
          .next-steps {
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          
          .next-steps h4 {
            color: #10b981;
            margin-bottom: 12px;
            font-size: 16px;
          }
          
          .next-steps ul {
            color: #64748b;
            padding-left: 20px;
          }
          
          .next-steps li {
            margin: 6px 0;
          }
          
          .reapplication-info {
            background: rgba(245, 158, 11, 0.05);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          
          .reapplication-info h4 {
            color: #f59e0b;
            margin-bottom: 8px;
            font-size: 16px;
          }
          
          .reapplication-info p {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 8px;
            transition: transform 0.2s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            color: white;
            text-decoration: none;
          }
          
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
          }
          
          .footer a {
            color: #3b82f6;
            text-decoration: none;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 24px 0;
          }
          
          @media (max-width: 600px) {
            .email-container {
              margin: 0;
              border-radius: 0;
            }
            
            .header, .content, .footer {
              padding: 24px 20px;
            }
            
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            
            .detail-value {
              text-align: left;
            }
            
            .cta-button {
              display: block;
              margin: 12px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="logo">🏢</div>
            <h1>Application Decision</h1>
            <p>Organization Registration Update</p>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <div class="rejection-message">
              <h2>Hello ${contactName || 'Application Team'},</h2>
              <p>Thank you for your interest in becoming an organizer on our platform. After careful review, we are unable to approve your application at this time.</p>
            </div>
            
            <!-- Application Details -->
            <div class="application-details">
              <h3>📋 Application Details</h3>
              <div class="detail-row">
                <span class="detail-label">Organization Name:</span>
                <span class="detail-value">${organizationName}</span>
              </div>
              ${contactName ? `
              <div class="detail-row">
                <span class="detail-label">Contact Person:</span>
                <span class="detail-value">${contactName}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${contactEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Application Date:</span>
                <span class="detail-value">${submissionDate}</span>
              </div>
            </div>
            
            <!-- Rejection Reason -->
            <div class="rejection-reason">
              <h3>❌ Reason for Rejection</h3>
              <h4>${selectedReason.title}</h4>
              <p><strong>Description:</strong> ${selectedReason.description}</p>
              <p><strong>Details:</strong> ${selectedReason.details}</p>
            </div>
            
            ${additionalNotes ? `
            <!-- Additional Notes -->
            <div class="additional-notes">
              <h4>📝 Additional Notes</h4>
              <p>${additionalNotes}</p>
            </div>
            ` : ''}
            
            ${reapplicationAllowed ? `
            <!-- Reapplication Information -->
            <div class="reapplication-info">
              <h4>🔄 Reapplication Information</h4>
              <p><strong>You may reapply any time you want.</strong></p>
              <p>Please address the issues mentioned above before resubmitting your application.</p>
              <p>We encourage you to review our organizer guidelines and requirements carefully.</p>
            </div>
            
            <!-- Next Steps -->
            <div class="next-steps">
              <h4>🚀 What You Can Do</h4>
              <ul>
                <li>Review our organizer guidelines and requirements thoroughly</li>
                <li>Address the specific issues mentioned in the rejection reason</li>
                <li>Gather any missing documentation or credentials</li>
                <li>Improve your organization's qualifications and experience</li>
                <li>Reapply after the waiting period has passed</li>
                <li>Contact our support team if you need clarification</li>
              </ul>
            </div>
            ` : `
            <!-- Alternative Options -->
            <div class="next-steps">
              <h4>🔍 Alternative Options</h4>
              <ul>
                <li>Review our organizer guidelines for future reference</li>
                <li>Consider partnering with existing approved organizers</li>
                <li>Explore other ways to participate in our platform ecosystem</li>
                <li>Contact our support team to discuss alternative solutions</li>
              </ul>
            </div>
            `}
            
            <!-- Action Buttons -->
            <div style="text-align: center;">
              <a href="${guidelinesUrl}" class="cta-button">
                📖 View Organizer Guidelines
              </a>
              <a href="mailto:${supportEmail}" class="cta-button">
                💬 Contact Support
              </a>
            </div>
            
            <div class="divider"></div>
            
            <!-- Closing Message -->
            <div style="text-align: center; margin: 24px 0;">
              <p style="color: #64748b; margin-bottom: 16px;">
                We appreciate the time and effort you put into your application. While we cannot approve it at this time, 
                we encourage you to address the mentioned concerns and consider reapplying in the future.
              </p>
              <p style="color: #64748b;">
                Thank you for your interest in our platform.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p><strong>Questions About This Decision?</strong></p>
            <p>Our support team is available to provide clarification:</p>
            <p>📧 <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            <p>📞 ${supportPhone}</p>
            <div class="divider"></div>
            <p style="font-size: 12px; color: #94a3b8;">
              This is an automated notification. Please do not reply to this email address.
            </p>
            <p style="font-size: 12px; color: #94a3b8;">
              © 2024 Your Company Name. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Organization Registration Application - Decision Notification

Hello ${contactName || 'Application Team'},

Thank you for your interest in becoming an organizer on our platform. After careful review, we are unable to approve your application at this time.

Application Details:
- Organization Name: ${organizationName}
${contactName ? `- Contact Person: ${contactName}` : ''}
- Email: ${contactEmail}
- Application Date: ${submissionDate}

Reason for Rejection: ${selectedReason.title}
Description: ${selectedReason.description}
Details: ${selectedReason.details}

${additionalNotes ? `Additional Notes:\n${additionalNotes}\n` : ''}

${reapplicationAllowed ? `Reapplication Information:
You may reapply after: ${reapplicationPeriod}
Please address the issues mentioned above before resubmitting your application.

What You Can Do:
- Review our organizer guidelines and requirements thoroughly
- Address the specific issues mentioned in the rejection reason
- Gather any missing documentation or credentials
- Improve your organization's qualifications and experience
- Reapply after the waiting period has passed
- Contact our support team if you need clarification` : `Alternative Options:
- Review our organizer guidelines for future reference
- Consider partnering with existing approved organizers
- Explore other ways to participate in our platform ecosystem
- Contact our support team to discuss alternative solutions`}

Organizer Guidelines: ${guidelinesUrl}

Questions About This Decision?
Our support team is available to provide clarification:
Email: ${supportEmail}
Phone: ${supportPhone}

We appreciate the time and effort you put into your application. While we cannot approve it at this time, we encourage you to address the mentioned concerns and consider reapplying in the future.

Thank you for your interest in our platform.

Best regards,
Organization Review Team
    `
  };
};

// ====================
// EMAIL SENDING FUNCTION
// ====================

const sendOrganizationRejectionEmail = async (rejectionData) => {
  try {
    const transporter = createEmailTransporter();
    const emailTemplate = createOrganizationRejectionEmailTemplate(rejectionData);

    const mailOptions = {
      from: {
        name: 'Organization Review Team',
        address: process.env.EMAIL_USER
      },
      to: rejectionData.contactEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      priority: 'normal',
      headers: {
        'X-Category': 'organization-rejection',
        'X-Organization': rejectionData.organizationName || ''
      }
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('✅ Organization rejection email sent successfully:', {
      messageId: result.messageId,
      to: rejectionData.contactEmail,
      organization: rejectionData.organizationName,
      reason: rejectionData.reason
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Organization rejection email sent successfully'
    };

  } catch (error) {
    console.error('❌ Failed to send organization rejection email:', error);

    return {
      success: false,
      error: error.message,
      message: 'Failed to send organization rejection email'
    };
  }
};

// ====================
// USAGE EXAMPLE
// ====================

// Example usage:
/*
const rejectionData = {
  organizationName: "Creative Events LLC",
  contactName: "Sarah Johnson",
  contactEmail: "sarah@creativeevents.com",
  submissionDate: "January 15, 2024",
  reason: "verification_failed", // Key from predefined reasons
  additionalNotes: "We were unable to verify your business registration number. Please provide updated documentation from your local business authority.",
  reapplicationAllowed: true,
  reapplicationPeriod: "30 days"
};

await sendOrganizationRejectionEmail(rejectionData);
*/

module.exports = {
  createEmailTransporter,
  sendPasswordSetupEmail,
  sendUserCreationEmail,
  sendOrganizationRejectionEmail
};