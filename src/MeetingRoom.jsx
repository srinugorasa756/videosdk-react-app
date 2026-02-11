import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { useRef, useEffect, useState } from "react";
import { getRoomId } from "./roomManager";
import { generateToken } from "./token";
import { getUserName } from "./userIdentity";
import "./styles.css";

/* ================= PARTICIPANT ================= */

function Participant({ participantId, roomLabel }) {
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
  } = useParticipant(participantId);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const isRelayed =
    !isLocal && displayName === localStorage.getItem("username");

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      videoRef.current.srcObject = new MediaStream([webcamStream.track]);
      videoRef.current.play().catch(() => {});
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micOn && micStream && audioRef.current) {
      audioRef.current.srcObject = new MediaStream([micStream.track]);
      audioRef.current.play().catch(() => {});
    }
  }, [micStream, micOn]);

  return (
    <div className="participant-tile">
      {webcamOn && (
        <video
          ref={videoRef}
          className="video"
          autoPlay
          muted={isLocal}
        />
      )}
      <audio ref={audioRef} autoPlay muted={isLocal} />

      <div className="participant-name">
        {displayName}
        {isRelayed
          ? " (Relayed from other room)"
          : ` (${roomLabel})`}
      </div>
    </div>
  );
}

/* ================= MEETING VIEW ================= */

function MeetingView({ roomId, onLeave, onSwitch }) {
  const {
    participants,
    join,
    leave,
    requestMediaRelay,
    stopMediaRelay,
  } = useMeeting({
    onMediaRelayStarted: ({ meetingId }) => {
      console.log("Relay started to:", meetingId);
    },
  });

  const [started, setStarted] = useState(false);
  const [relayActive, setRelayActive] = useState(false);

  const participantCount = participants.size;

  const roomLabel =
    roomId === getRoomId("ROOM_1") ? "Room 1" : "Room 2";

  const otherRoomKey =
    roomId === getRoomId("ROOM_1") ? "ROOM_2" : "ROOM_1";

  const otherRoomId = getRoomId(otherRoomKey);

  /* Required for browser autoplay policy */
  const startMeeting = () => {
    join();
    setStarted(true);
  };

  /* DEMO A: Media Relay */
  const handleRelay = async () => {
    await requestMediaRelay({
      destinationMeetingId: otherRoomId,
      kinds: ["video", "audio"],
    });
    setRelayActive(true);
  };

  /* Switch Room (leave → join) */
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

  /* PRE-JOIN SCREEN */
  if (!started) {
    return (
      <div className="container">
        <h3>Ready to join meeting</h3>
        <button onClick={startMeeting}>Start Meeting</button>
      </div>
    );
  }

  /* MEETING UI */
  return (
    <div className="meeting-container">
      <div className="room-id-bar">
        <span>Room ID:</span>
        <strong>{roomId}</strong>
      </div>

      <div
        className={`video-area ${
          participantCount === 1 ? "single-user" : "multi-user"
        }`}
      >
        {[...participants.keys()].map((id) => (
          <Participant
            key={id}
            participantId={id}
            roomLabel={roomLabel}
          />
        ))}
      </div>

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

/* ================= PROVIDER ================= */

export default function MeetingRoom({ roomId, token, onLeave }) {
  const [nextRoom, setNextRoom] = useState(null);
  const [nextToken, setNextToken] = useState(null);

  const baseName = getUserName();

  const displayName =baseName;
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
        name: displayName,
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
