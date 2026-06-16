interface TempRegistration {
  otp: string;
  expiresAt: number;
  data: any;
}

const globalForOtp = global as unknown as {
  tempRegistrations: Map<string, TempRegistration>;
};

export const tempRegistrations =
  globalForOtp.tempRegistrations || new Map<string, TempRegistration>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.tempRegistrations = tempRegistrations;
}
