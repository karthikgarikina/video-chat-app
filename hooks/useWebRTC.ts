"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

export const useWebRTC = (
  socket: Socket | null,
  roomId: string,
  localStream: MediaStream | null
) => {
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    if (!socket || !localStream) return;

    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: process.env.NEXT_PUBLIC_STUN_SERVER!,
        },
      ],
    };

    socket.emit("join-room", { roomId });

    socket.on("all-users", (users: string[]) => {
      users.forEach((userId) => {
        const peer = createPeer(userId);

        peersRef.current[userId] = peer;
      });
    });

    socket.on("user-joined", (userId: string) => {
      const peer = addPeer(userId);

      peersRef.current[userId] = peer;
    });

    socket.on("offer", async ({ caller, sdp }) => {
      const peer = addPeer(caller);

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peer.createAnswer();

      await peer.setLocalDescription(answer);

      socket.emit("answer", {
        target: caller,
        sdp: answer,
      });
    });

    socket.on("answer", async ({ caller, sdp }) => {
      const peer = peersRef.current[caller];

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", ({ caller, candidate }) => {
      const peer = peersRef.current[caller];

      if (peer) {
        peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    function createPeer(userId: string) {
      const peer = new RTCPeerConnection(configuration);

      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: userId,
            candidate: event.candidate,
          });
        }
      };

      peer.createOffer().then((offer) => {
        peer.setLocalDescription(offer);

        socket.emit("offer", {
          target: userId,
          sdp: offer,
        });
      });

      return peer;
    }

    function addPeer(userId: string) {
      const peer = new RTCPeerConnection(configuration);

      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: userId,
            candidate: event.candidate,
          });
        }
      };

      return peer;
    }
  }, [socket, localStream, roomId]);
};