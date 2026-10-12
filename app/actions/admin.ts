"use server";

export async function verifyAdminPassword(password: string) {
  return password === process.env.ADMIN_PASSWORD;
}
