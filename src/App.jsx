import { useEffect, useState } from "react";
import JoinScreen from "./JoinScreen";
import MeetingRoom from "./MeetingRoom";
import { initRooms } from "./roomManager";
import "./styles.css";

export default function App() {
  const [roomId, setRoomId] = useState(null);
  const [token, setToken] = useState(null);
  const [roomsReady, setRoomsReady] = useState(false);

  useEffect(() => {
    const setupRooms = async () => {
      await initRooms();
      setRoomsReady(true);
    };
    setupRooms();
  }, []);

  const handleJoin = (roomId, token) => {
    setRoomId(roomId);
    setToken(token);
  };

  const handleLeave = () => {
    setRoomId(null);
    setToken(null);
  };

  if (!roomsReady) {
    return <div className="container">Preparing rooms…</div>;
  }

  return roomId ? (
    <MeetingRoom roomId={roomId} token={token} onLeave={handleLeave} />
  ) : (
    <JoinScreen onJoin={handleJoin} />
  );
}
