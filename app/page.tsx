"use client";

import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const id = uuidv4();
    router.push(`/room/${id}`);
  };

  const joinRoom = () => {
    if (!roomId) return;
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Video Chat App</h1>

      <button
        onClick={createRoom}
        className="bg-blue-500 text-white px-6 py-3 rounded"
      >
        Create Meeting
      </button>

      <div className="flex gap-2">
        <input
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border px-4 py-2"
        />

        <button
          onClick={joinRoom}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Join
        </button>
      </div>
    </div>
  );
}