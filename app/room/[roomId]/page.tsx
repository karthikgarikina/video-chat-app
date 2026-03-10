"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useUserMedia } from "@/hooks/useUserMedia";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const socketRef = useSocket();
  const localStream = useUserMedia();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useWebRTC(socketRef.current, roomId, localStream);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold">Room: {roomId}</h1>

      <video
        ref={videoRef}
        data-test-id="local-video"
        autoPlay
        muted
        className="w-96 mt-4 border"
      />

      <div
        data-test-id="remote-video-container"
        className="grid grid-cols-2 gap-4 mt-6"
      ></div>
    </div>
  );
}