export function GetLocalHost() {
  const host = "https://dibylocal.com:8000";

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    console.log('context cookies:',cookies)
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      console.log(key,value)
      if (key === "e") return value;
    }
    return null;
  };
  const GetLanguage = () => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === "lang") return value;
    }
    return "en"; // Default language if not found
  };
 const ValidateToken = async (token) => {
  console.log('vlidating:',token)
    try {
      const response = await fetch(`${host}/validate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        return false; // Token is invalid
      }
      const data = await response.json();
      return data.valid; // Assuming the response contains a 'valid' field
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }
  return { host, getTokenFromCookies,ValidateToken,GetLanguage };
}
export const host = "https://dibylocal.com:8000";
