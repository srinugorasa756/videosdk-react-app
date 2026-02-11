import { SignJWT } from "jose";

const API_KEY = "43f23c6f-3084-49e9-bc7f-9938b7c87f0c";
const API_SECRET = "80ef3f3b5a02bb13ee3f77e85367ded36bb5106508f4768b107162d8ce87449d";

export const generateToken = async () => {
  const secret = new TextEncoder().encode(API_SECRET);

  const token = await new SignJWT({
    apikey: API_KEY,
    permissions: ["allow_join"],
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return token;
};
