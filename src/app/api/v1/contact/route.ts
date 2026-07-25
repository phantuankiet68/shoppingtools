import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, email, phone, message } = body;

        await resend.emails.send({
            from: 'Contact <onboarding@resend.dev>',
            to: 'tuankietity@gmail.com',
            subject: 'New Contact',
            html: `
                <h2>New Contact</h2>

                <p><strong>Name:</strong> ${name}</p>

                <p><strong>Email:</strong> ${email}</p>

                <p><strong>Phone:</strong> ${phone}</p>

                <p><strong>Message:</strong></p>

                <p>${message}</p>
            `,
        });

        return Response.json({
            success: true,
        });
    } catch (err) {
        console.error(err);

        return Response.json({
            success: false,
        });
    }
}
