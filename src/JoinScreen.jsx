import { getRoomId } from "./roomManager";
import { generateToken } from "./token";

export default function JoinScreen({ onJoin }) {
  const joinRoom = async (roomKey) => {
    const roomId = getRoomId(roomKey);
    const token = await generateToken();
    onJoin(roomId, token);
  };

  return (
    <div className="container">
      <h2>VideoSDK Meeting</h2>

      <button onClick={() => joinRoom("ROOM_1")}>
        Join Room 1
      </button>

      <button onClick={() => joinRoom("ROOM_2")}>
        Join Room 2
      </button>
    </div>
  );
}
