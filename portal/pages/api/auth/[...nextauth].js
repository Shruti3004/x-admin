import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import axios from "axios";
const CryptoJS = require('crypto-js');

const fusionAuthLogin = async (path, credentials) => {
  const base64Key = CryptoJS.enc.Base64.parse(process.env.NEXT_PUBLIC_BASE64_KEY);
  // let byteEncodedUsername  = CryptoJS.AES.decrypt(credentials.loginId, base64Key, {
  //   mode: CryptoJS.mode.ECB,
  //   padding: CryptoJS.pad.Pkcs7
  // });
  // let decryptedLoginId = byteEncodedUsername.toString(CryptoJS.enc.Utf8);

  // let byteEncodedPassword = CryptoJS.AES.decrypt(credentials.password, base64Key, {
  //   mode: CryptoJS.mode.ECB,
  //   padding: CryptoJS.pad.Pkcs7
  // });
  // let decryptedPassword = byteEncodedPassword.toString(CryptoJS.enc.Utf8);

  const options = {
    headers: { Authorization: process.env.FUSIONAUTH_API_KEY },
  };
  const response = await axios.post(
    `${path}/api/login`,
    {
      loginId: credentials.loginId,
      password: credentials.password,
      applicationId: credentials.applicationId,
    },
    options
  );
  return response;
};

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      id: "fusionauth",
      name: "FusionAuth Credentials Login",
      async authorize(credentials, req) {
        let response = null;
        try {
          response = await fusionAuthLogin(
            process.env.FUSIONAUTH_DOMAIN,
            credentials
          );
          console.log(credentials);
          console.log(process.env.FUSIONAUTH_DOMAIN);
          if (response) {
            console.log("FUSION AUTH",response.data);
            return response.data?.user;
          }
        } catch (err) {
          throw err;
        }
      },
    }),
  ],
  session: {
    jwt: true,
  },
  callbacks: {
    redirect(url, baseUrl) {
      return url;
    },
    async jwt(token, user, account, profile, isNewUser) {
      console.log(user, account, profile);
      // Add access_token to the token right after signin
      if (account) {
        token.username = profile.user?.username;
        token.fullName = profile.user?.fullName;
        token.role = profile.user?.registrations?.[0].roles?.[0];
        token.applicationId = profile.user?.registrations?.[0].applicationId;
        token.jwt = profile.token;
      }
      return token;
    },
    async session(session, token) {
      console.log("SESSION", session);
      console.log("TOKEN", token);
      session.jwt = token.jwt;
      session.role = token.role;
      session.fullName = token.fullName;
      session.username = token.username;
      session.applicationId = token.applicationId;
      return session;
    },
  },
});