export const GetLanguage = () => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === "lang") return value;
    }
    return "en"; // Default language if not found
  };