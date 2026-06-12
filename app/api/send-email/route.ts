import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// Initialize Nodemailer transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email;
    const name = body.name || body.guestName;
    const brideName = body.brideName || 'Ananda';
    const groomName = body.groomName || 'Angga';
    const weddingDate = body.weddingDate;
    const venueName = body.venueName || 'Hotel Grand Tjokro Bandung';

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
    }

    let formattedWeddingDate = '13 Juni 2026';
    if (weddingDate) {
      try {
        const date = new Date(weddingDate);
        if (!isNaN(date.getTime())) {
          formattedWeddingDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
      } catch (e) {
        // ignore
      }
    }

    // Generate clean QR Code URL without logo
    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(name)}&size=250&ecLevel=H`;

    const mailOptions = {
      from: `"Wedding Invitation" <${process.env.GMAIL_USER}>`, 
      to: email,
      subject: `RSVP Confirmation - ${groomName} & ${brideName} Wedding`,
      html: `
        <div style="font-family: serif, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
          <h1 style="text-align: center; color: #333; letter-spacing: 2px;">${groomName.toUpperCase()} & ${brideName.toUpperCase()}</h1>
          <div style="height: 1px; background: #d4af37; width: 100px; margin: 20px auto;"></div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; text-align: center;">
            Dear <strong>${name}</strong>,
          </p>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
            Thank you for confirming your attendance at our wedding. We are so excited to celebrate our special day with you!
          </p>
          
          <div style="text-align: center; margin: 40px 0; background: #0a0a0a; border-radius: 30px; overflow: hidden; border: 1px solid #222;">
            <div style="background: #ffffff; padding: 30px;">
              <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 20px;">Your Entry Access Code</p>
              <img src="${qrCodeUrl}" alt="Check-in QR Code" style="width: 200px; height: 200px; border-radius: 10px; border: 10px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.05);" />
              <h2 style="margin-top: 20px; font-weight: bold; color: #000; letter-spacing: 1px;">${name.toUpperCase()}</h2>
              <p style="font-size: 11px; color: #999; font-style: italic; margin-top: 10px;">Please show this QR code at the reception for check-in.</p>
            </div>
            
            <div style="padding: 20px 15px; background: #0a0a0a; border-top: 1px solid #222;">
              <div style="font-size: 16px; font-family: serif; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; margin-bottom: 8px;">Sera Story</div>
              <div style="font-size: 9px; font-family: sans-serif; letter-spacing: 3px; color: #888; text-transform: uppercase;">&copy; 2026 All Rights Reserved.</div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #aaa;">
            <p>${formattedWeddingDate} | ${venueName}</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
