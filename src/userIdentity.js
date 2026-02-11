const USER_KEY = "VIDEOSDK_USER_NAME";

export const getUserName = () => {
  let name = localStorage.getItem(USER_KEY);

  if (!name) {
    const random = Math.floor(1000 + Math.random() * 9000);
    name = `User-${random}`;
    localStorage.setItem(USER_KEY, name);
  }

  return name;
};
