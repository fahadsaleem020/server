import { BrevoClient } from "@getbrevo/brevo";
import { env } from "@/utils/env.util";

export const brevo = new BrevoClient({ apiKey: env.BREVO_API_KEY });

export const sendEmail = (payload: Parameters<typeof brevo.transactionalEmails.sendTransacEmail>[0]) =>
  brevo.transactionalEmails.sendTransacEmail(payload);
