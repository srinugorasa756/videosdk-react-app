import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { useRef, useEffect, useState } from "react";
import { getRoomId } from "./roomManager";
import { generateToken } from "./token";

function Participant({ participantId }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      videoRef.current.srcObject = new MediaStream([webcamStream.track]);
      videoRef.current.play();
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micOn && micStream && audioRef.current) {
      audioRef.current.srcObject = new MediaStream([micStream.track]);
      audioRef.current.play();
    }
  }, [micStream, micOn]);

  return (
    <>
      {webcamOn && (
        <video
          ref={videoRef}
          className="video"
          autoPlay
          muted={isLocal}
        />
      )}
      <audio ref={audioRef} autoPlay muted={isLocal} />
    </>
  );
}

function MeetingView({ roomId, onLeave, onSwitch }) {
  const {
    participants,
    join,
    leave,
    requestMediaRelay,
    stopMediaRelay,
  } = useMeeting();

  const [relayActive, setRelayActive] = useState(false);

  useEffect(() => {
    join();
  }, []);

  const participantCount = participants.size;

  const otherRoomKey =
    roomId === getRoomId("ROOM_1") ? "ROOM_2" : "ROOM_1";
  const otherRoomId = getRoomId(otherRoomKey);

  // 🔹 DEMO A: Start Relay
  const handleRelay = async () => {
    await requestMediaRelay({
      destinationMeetingId: otherRoomId,
      kinds: ["video", "audio"],
    });
    setRelayActive(true);
  };

  // 🔹 Stop relay before switch
  const handleSwitch = async () => {
    if (relayActive) {
      stopMediaRelay(otherRoomId);
      setRelayActive(false);
    }

    leave();
    onLeave();

    setTimeout(async () => {
      const token = await generateToken();
      onSwitch(otherRoomId, token);
    }, 300);
  };

  return (
    <div className="meeting-container">
      {/* Room ID */}
      <div className="room-id-bar">
        <span>Room ID:</span>
        <strong>{roomId}</strong>
      </div>

      {/* Video area */}
      <div
        className={`video-area ${
          participantCount === 1 ? "single-user" : "multi-user"
        }`}
      >
        {[...participants.keys()].map((id) => (
          <Participant key={id} participantId={id} />
        ))}
      </div>

      {/* Controls */}
      <div className="control-bar">
        <button onClick={handleRelay} disabled={relayActive}>
          Relay to Other Room
        </button>

        <button onClick={handleSwitch}>
          Switch to Other Room
        </button>

        <button
          className="leave-btn"
          onClick={() => {
            leave();
            onLeave();
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
}

export default function MeetingRoom({ roomId, token, onLeave }) {
  const [nextRoom, setNextRoom] = useState(null);
  const [nextToken, setNextToken] = useState(null);

  if (nextRoom) {
    return (
      <MeetingRoom
        roomId={nextRoom}
        token={nextToken}
        onLeave={onLeave}
      />
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId: roomId,
        micEnabled: true,
        webcamEnabled: true,
        name: "User",
      }}
      token={token}
    >
      <MeetingView
        roomId={roomId}
        onLeave={onLeave}
        onSwitch={(rid, tok) => {
          setNextRoom(rid);
          setNextToken(tok);
        }}
      />
    </MeetingProvider>
  );
}
