import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/Videocam";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ChatIcon from "@mui/icons-material/Chat";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import Squares from "./Squares1";

import io from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import "./Videomeet.css";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import server from "../../environment";

const server_url = server.prod;

var connections = {};
const peerconfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function VideoMeet() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localvideoRef = useRef();

  const [videoAvailable, setvideoAvailable] = useState(true);
  const [audioAvailable, setaudioAvailable] = useState(true);
  const [video, setVideo] = useState([]);
  const [audio, setaudio] = useState();
  const [screen, setscreen] = useState();
  const [showModel, setModel] = useState(true);
  const [screenAvialable, setscreenAvialable] = useState();
  const [messages, setmessages] = useState([]);
  const [message, setmessage] = useState("");
  const [newMessage, setnewMessage] = useState(0);
  const [askforusername, setaskforUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setvideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setaudioAvailable(!!audioPermission);

      setscreenAvialable(!!navigator.mediaDevices.getDisplayMedia);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        window.localStream = userMediaStream;
        if (localvideoRef.current) {
          localvideoRef.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }
    window.localStream = stream;
    localvideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setaudio(false);
        })
    );
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video, audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localvideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };
  let addmessage = (data, sender, socketIdSender) => {
    setmessages((prev) => [...prev, { sender: sender, data: data }]);
    if (socketIdSender !== socketIdRef.current) {
      setmessages((prev) => prev + 1);
    }
  };

  const connecttoSocketServer = () => {
    socketRef.current = io(server_url);

    socketRef.current.on("connect", () => {
      console.log("Client successfully connected to server");
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
      setmessages((prev) => [...prev, { sender, data }]);

      if (socketIdSender !== socketIdRef.current) {
        setnewMessage((prev) => prev + 1);
      }
    });

    socketRef.current.on("user-left", (id) => {
      setVideos((videos) => videos.filter((video) => video.socketId !== id));
    });

    socketRef.current.on("user-joined", (id, clients) => {
      clients.forEach((socketListId) => {
        connections[socketListId] = new RTCPeerConnection(
          peerconfigConnections
        );

        connections[socketListId].onicecandidate = (event) => {
          if (event.candidate !== null) {
            socketRef.current.emit(
              "signal",
              socketListId,
              JSON.stringify({ ice: event.candidate })
            );
          }
        };

        connections[socketListId].onaddstream = (event) => {
          setVideos((prevVideos) => {
            const index = prevVideos.findIndex(
              (v) => v.socketId === socketListId
            );
            if (index !== -1) {
              // Update existing stream
              const updatedVideos = [...prevVideos];
              updatedVideos[index] = {
                ...updatedVideos[index],
                stream: event.stream,
              };
              return updatedVideos;
            } else {
              // Add new stream
              return [
                ...prevVideos,
                {
                  socketId: socketListId,
                  stream: event.stream,
                  autoplay: true,
                  playsinline: true,
                },
              ];
            }
          });
        };

        if (window.localStream) {
          connections[socketListId].addStream(window.localStream);
        } else {
          const blackSilence = () => new MediaStream([black(), silence()]);
          window.localStream = blackSilence();
          connections[socketListId].addStream(window.localStream);
        }
      });

      if (id === socketIdRef.current) {
        for (let id2 in connections) {
          if (id2 === socketIdRef.current) continue;
          connections[id2].addStream(window.localStream);
          connections[id2].createOffer().then((description) => {
            connections[id2]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription })
                );
              })
              .catch((e) => console.log(e));
          });
        }
      }
    });
  };

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setaudio(audioAvailable);
    connecttoSocketServer();
  };

  const connect = () => {
    setaskforUsername(false);
    getMedia();
  };

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let handlevideo = () => {
    setVideo(!video);
  };
  let handleAudio = () => {
    setaudio(!audio);
  };
  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localvideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setscreen(false);

          try {
            let tracks = localvideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localvideoRef.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => {
            console.log(e);
          });
      }
    }
  };
  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setscreen(!screen);
  };
  let sendmessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setmessage("");
  };

  let handleendcall = () => {
    try {
      for (let id in connections) {
        connections[id].close();
        delete connections[id];
      }
      socketRef.current?.disconnect();
      setVideos([]);
      setmessages([]);
      setnewMessage(0);
      setscreen(false);
      setaskforUsername(true);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (askforusername && window.localStream && localvideoRef.current) {
      localvideoRef.current.srcObject = window.localStream;
    }
  }, [askforusername]);

  return (
    <div>
      {askforusername ? (
        <div
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Animated Grid Background */}
          <Squares
            speed={1}
            direction="diagonal"
            hoverFillColor="#1FA848"
            squareSize={70}
            className="grid-background"
            borderColor="#1FA848"
          />
          {/* Username Form Content */}
          <div
            style={{
              position: "absolute",
              zIndex: 1,
              width: "100vw",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              // background: 'rgba(0,0,0,0.6)' // optional: darken for readability
            }}
          >
            <h2 style={{ color: "black" }}>Enter into lobby</h2>
            <TextField
              id="outlined-basic"
              label="Username"
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              sx={{
                marginBottom: "1.5rem",
                input: { color: "black" },
                label: { color: "#1FA848" },
              }}
            />
            <Button
              variant="contained"
              onClick={connect}
              sx={{
                backgroundColor: "#1FA848",
                color: "#fff", 
                "&:hover": {
                  backgroundColor: "#178A3A", 
                },
              }}
            >
              Connect
            </Button>
            <div style={{ marginTop: "2rem" }}>
              <video
                ref={localvideoRef}
                autoPlay
                muted
                style={{ borderRadius: 8, width: 520 }}
              ></video>
            </div>
          </div>
        </div>
      ) : (
        <div className="meetVideocontainer">
          {showModel ? (
            <div className="chatroom">
              <div className="chat-container">
                <div className="chatdisplay">
                  {messages.map((item, index) => {
                    return (
                      <div key={index}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="chatting-area">
                  <TextField
                    value={message}
                    onChange={(e) => setmessage(e.target.value)}
                    id="outlined-basic"
                    label="msg"
                    variant="outlined"
                  />
                  <Button
                    onClick={sendmessage}
                    variant="contained"
                    style={{ marginLeft: "1rem" }}
                  >
                    send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          <div className="buttoncontainer">
            <IconButton onClick={handlevideo}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleendcall}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvialable === true ? (
              <IconButton onClick={handleScreen}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : null}
            <Badge
              badgeContent={newMessage}
              style={{ fontSize: "3rem" }}
              max={999}
            >
              <ChatIcon onClick={() => setModel(!showModel)} />
            </Badge>
          </div>

          <video
            className="meetuservideo"
            ref={localvideoRef}
            autoPlay
            muted
          ></video>

          <div className="conference-container">
            {videos
              .filter((video) => video.stream) // Only render if stream exists
              .map((video) => (
                <div className="conferenceview" key={video.socketId}>
                  <video
                    data-socket={video.socketId}
                    autoPlay
                    playsInline
                    ref={(ref) => {
                      if (
                        ref &&
                        video.stream &&
                        ref.srcObject !== video.stream
                      ) {
                        ref.srcObject = video.stream;
                      }
                    }}
                  ></video>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoMeet;
