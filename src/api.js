export const createRoom = async (token) => {
  const res = await fetch("https://api.videosdk.live/v2/rooms", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return data.roomId;
};
