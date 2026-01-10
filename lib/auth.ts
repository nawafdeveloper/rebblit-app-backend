import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { bearer, emailOTP, twoFactor, username } from "better-auth/plugins";

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
                    // send otp to user
                    console.log('🔐 DEV 2FA OTP:', otp);
                    console.log('👤 User:', user.email);
                },
            },
        }),
        username(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "sign-in") {
                    // Send the OTP for sign in
                    console.log('🔐 DEV 2FA OTP:', otp);
                    console.log('👤 User:', email);
                } else if (type === "email-verification") {
                    // Send the OTP for email verification
                } else {
                    // Send the OTP for password reset
                }
            },
        }),
        bearer()
    ]
});

type Session = typeof auth.$Infer.Session