"use client";

import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Room: {roomId}</h1>

      <video
        data-test-id="local-video"
        autoPlay
        muted
        className="w-96 border mt-4"
      />

      <div
        data-test-id="remote-video-container"
        className="grid grid-cols-2 gap-4 mt-4"
      ></div>

      <div className="flex gap-4 mt-6">
        <button data-test-id="mute-mic-button" className="bg-gray-200 px-4 py-2">
          Mute
        </button>

        <button
          data-test-id="toggle-camera-button"
          className="bg-gray-200 px-4 py-2"
        >
          Camera
        </button>

        <button
          data-test-id="hangup-button"
          className="bg-red-500 text-white px-4 py-2"
        >
          Hang Up
        </button>
      </div>
    </div>
  );
}