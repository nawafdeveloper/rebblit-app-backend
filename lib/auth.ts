import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { bearer, emailOTP, twoFactor, username } from "better-auth/plugins";
import { sendEmail } from "@/helper/send-email";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    advanced: {
        disableOriginCheck: true
    },
    user: {
        additionalFields: {
            hasProfile: {
                type: "boolean",
                defaultValue: false
            }
        }
    },
    plugins: [
        twoFactor({
            skipVerificationOnEnable: true,
            otpOptions: {
                async sendOTP({ user, otp }) {
                    await sendEmail({
                        from: 'Acme <testin@updates.mahjuoz.com>',
                        to: user.email,
                        subject: 'OTP Two Factor Verification',
                        text: `Your two factor verification code is this: ${otp}`
                    })
                },
            },
        }),
        username(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "sign-in") {
                    await sendEmail({
                        from: 'Acme <testin@updates.mahjuoz.com>',
                        to: email,
                        subject: 'OTP Email sign in',
                        text: `Your verification code is this: ${otp}`
                    })
                } else if (type === "email-verification") {
                    await sendEmail({
                        from: 'Acme <testin@updates.mahjuoz.com>',
                        to: email,
                        subject: 'Verify your email address',
                        text: `Your verification code is this: ${otp}`
                    })
                } else {
                    await sendEmail({
                        from: 'Acme <testin@updates.mahjuoz.com>',
                        to: email,
                        subject: 'Password reset',
                        text: `Your verification code is this: ${otp}`
                    })
                }
            },
        }),
        bearer()
    ]
});

type Session = typeof auth.$Infer.Session