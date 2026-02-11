import { createRoom } from "./api";
import { generateToken } from "./token";

const STORAGE_KEY = "VIDEOSDK_ROOMS";

let rooms = {
  ROOM_1: null,
  ROOM_2: null,
};

// 🔹 Create rooms once & persist
export const initRooms = async () => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    rooms = JSON.parse(stored);
    return rooms;
  }

  const token = await generateToken();

  rooms.ROOM_1 = await createRoom(token);
  rooms.ROOM_2 = await createRoom(token);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  return rooms;
};

export const getRoomId = (roomKey) => rooms[roomKey];
