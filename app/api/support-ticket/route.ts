import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, subject, message, priority, userName, userEmail } = body

    // Validate required fields
    if (!category || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Gmail credentials from environment variables
    const gmailUser = process.env.GMAIL_USER
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
    const supportEmail = process.env.SUPPORT_EMAIL

    if (!gmailUser || !gmailAppPassword || !supportEmail) {
      console.error('Missing email configuration')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Create transporter using SMTP_SSL (port 465) like the Python code
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    // Priority badge colors
    const priorityColors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626',
    }

    const priorityColor = priorityColors[priority] || '#6B7280'

    // Format email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Ticket</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Support Ticket</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Reserva Admin Platform</p>
          </div>

          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

              <!-- Priority Badge -->
              <div style="margin-bottom: 20px;">
                <span style="background: ${priorityColor}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${priority} Priority
                </span>
              </div>

              <!-- Category -->
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Category</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                  ${category === 'technical' ? '🔧 Technical Issue' :
                    category === 'billing' ? '💳 Billing & Subscription' :
                    category === 'feature' ? '✨ Feature Request' :
                    category === 'account' ? '👤 Account Management' :
                    '📝 Other'}
                </p>
              </div>

              <!-- Subject -->
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Subject</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">${subject}</p>
              </div>

              <!-- Message -->
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Message</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
                  <p style="margin: 0; white-space: pre-wrap; color: #374151; line-height: 1.8;">${message}</p>
                </div>
              </div>

              <!-- User Information -->
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #dbeafe;">
                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">👤 User Information</p>
                <div style="display: grid; gap: 8px;">
                  <div>
                    <span style="color: #6b7280; font-size: 14px;">Name:</span>
                    <span style="color: #111827; font-weight: 600; margin-left: 8px; font-size: 14px;">${userName || 'N/A'}</span>
                  </div>
                  <div>
                    <span style="color: #6b7280; font-size: 14px;">Email:</span>
                    <span style="color: #111827; font-weight: 600; margin-left: 8px; font-size: 14px;">${userEmail || 'N/A'}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 5px 0;">This is an automated message from Reserva Admin Platform</p>
              <p style="margin: 5px 0;">Received: ${new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'full',
                timeStyle: 'long'
              })}</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email
    await transporter.sendMail({
      from: `"Reserva Support" <${gmailUser}>`,
      to: supportEmail,
      subject: `[${priority.toUpperCase()}] Support Ticket: ${subject}`,
      html: htmlContent,
      replyTo: userEmail || gmailUser,
    })

    return NextResponse.json(
      { success: true, message: 'Support ticket sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to send support ticket', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
