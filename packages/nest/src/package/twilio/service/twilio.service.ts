import { Inject, Injectable } from "@nestjs/common";
import { Twilio } from "twilio";

import { TwilioErrorCode } from "@/package/twilio/constant/twilio-error-codes.constant";
import { OtpVerificationFailedException } from "@/package/twilio/exception/otp-verification-failed.exception";
import { OtpCanceledException } from "@/package/twilio/exception/otp-canceled.exception";
import { OtpMaxAttemptsException } from "@/package/twilio/exception/otp-max-attempts.exception";
import { InvalidOtpException } from "@/package/twilio/exception/invalid-otp.exception";
import { OtpExpiredException } from "@/package/twilio/exception/otp-expired.exception";
import { OtpSendFailedException } from "@/package/twilio/exception/otp-send-failed.exception";
import { TWILIO_MODULE_OPTIONS } from "../constant/twilio.constants";
import type { TwilioModuleOptions } from "../interface/twilio-options.interface";

@Injectable()
export class TwilioService {
  private readonly client: Twilio;
  private readonly verifyServiceSid: string;

  constructor(@Inject(TWILIO_MODULE_OPTIONS) options: TwilioModuleOptions) {
    this.client = new Twilio(options.accountSid, options.authToken);
    this.verifyServiceSid = options.verifyServiceSid;
  }

  async sendOtp(phone: string): Promise<void> {
    try {
      await this.client.verify.v2.services(this.verifyServiceSid).verifications.create({
        to: phone,
        channel: "sms",
      });
    } catch (error) {
      if (error.code === TwilioErrorCode.MAX_SEND_ATTEMPTS_REACHED) {
        throw new OtpMaxAttemptsException();
      }

      throw new OtpSendFailedException(error.message);
    }
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    let status: string;

    try {
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phone,
          code,
        });

      status = verification.status;
    } catch (error) {
      if (error.code === TwilioErrorCode.MAX_CHECK_ATTEMPTS_REACHED) {
        throw new OtpMaxAttemptsException();
      }

      if (error.code === TwilioErrorCode.VERIFICATION_NOT_FOUND) {
        throw new InvalidOtpException("Verification not found");
      }

      throw new OtpVerificationFailedException(error.message);
    }

    switch (status) {
      case "pending":
        throw new OtpVerificationFailedException();
      case "approved":
        return true;
      case "canceled":
        throw new OtpCanceledException();
      case "max_attempts_reached":
        throw new OtpMaxAttemptsException();
      case "deleted":
        throw new InvalidOtpException("Verification was deleted");
      case "expired":
        throw new OtpExpiredException();
      default:
        throw new OtpVerificationFailedException(`Unexpected verification status: ${status}`);
    }
  }
}
