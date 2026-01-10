import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    from,
    to,
    subject,
    text
}: {
    from: string;
    to: string;
    subject: string;
    text: string;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: from,
            to: to,
            subject: subject,
            text: text,
        });

        if (error) {
            return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}