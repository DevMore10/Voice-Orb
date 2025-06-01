import { useState, useCallback } from "react";
import { Mic, MessageCircle, Users, Send } from "lucide-react";
import { useConversation } from "@elevenlabs/react";

export default function VoicePanel() {
  const [activeMode, setActiveMode] = useState("talk");
  const [chatMessage, setChatMessage] = useState("");

  // ElevenLabs conversation hook for Talk mode
  const talkConversation = useConversation({
    onConnect: () => console.log("Connected to Kiaan (Talk)"),
    onDisconnect: () => console.log("Disconnected from Kiaan (Talk)"),
    onMessage: (message) => console.log("Talk message from Kiaan:", message),
    onError: (error) => console.error("Talk conversation error:", error),
  });

  // ElevenLabs conversation hook for Meeting mode
  const meetingConversation = useConversation({
    onConnect: () => console.log("Connected to Meeting Agent"),
    onDisconnect: () => console.log("Disconnected from Meeting Agent"),
    onMessage: (message) => console.log("Meeting message from agent:", message),
    onError: (error) => console.error("Meeting conversation error:", error),
  });

  // Get the active conversation based on mode
  const getActiveConversation = () => {
    return activeMode === "meeting" ? meetingConversation : talkConversation;
  };

  const conversation = getActiveConversation();

  const modeConfig = {
    talk: {
      title: "Talk With Kiaan",
      instruction:
        talkConversation.status === "connected"
          ? `${talkConversation.isSpeaking ? "Kiaan is speaking..." : "Listening... speak now"}`
          : "Tap the microphone to start speaking with Kiaan",
      micAction: talkConversation.status === "connected" ? "end conversation" : "start speaking",
    },
    meeting: {
      title: "Meeting Mode",
      instruction:
        meetingConversation.status === "connected"
          ? `${
              meetingConversation.isSpeaking
                ? "Meeting agent is speaking..."
                : "Meeting in progress... speak now"
            }`
          : "Tap the microphone to start a meeting session",
      micAction: meetingConversation.status === "connected" ? "end meeting" : "start meeting",
    },
    chat: {
      title: "Chat with Kiaan",
      instruction: "Type your message below to chat with Kiaan",
      micAction: "send voice message",
    },
  };

  const currentMode = modeConfig[activeMode];

  // Handle Talk mode conversation
  const handleTalkMode = useCallback(async () => {
    if (talkConversation.status === "connected") {
      // End the talk conversation
      await talkConversation.endSession();
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // Start the conversation with talk agent
        await talkConversation.startSession({
          agentId: "agent_01jwp6q5tge3hbn2j3s8bcbj96",
        });
      } catch (error) {
        console.error("Failed to start talk conversation:", error);
        alert("Failed to start conversation. Please check your microphone permissions.");
      }
    }
  }, [talkConversation]);

  // Handle Meeting mode conversation
  const handleMeetingMode = useCallback(async () => {
    if (meetingConversation.status === "connected") {
      // End the meeting conversation
      await meetingConversation.endSession();
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // Start the conversation with meeting agent
        await meetingConversation.startSession({
          agentId: "agent_01jwp8q782f9jsg9zxej1qhdde",
        });
      } catch (error) {
        console.error("Failed to start meeting conversation:", error);
        alert("Failed to start meeting. Please check your microphone permissions.");
      }
    }
  }, [meetingConversation]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Handle sending message logic here
      console.log("Sending message:", chatMessage);
      setChatMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicrophoneClick = () => {
    if (activeMode === "talk") {
      handleTalkMode();
    } else if (activeMode === "meeting") {
      handleMeetingMode();
    }
    // Chat mode doesn't use the microphone button for starting conversations
  };

  const getConnectionStatus = () => {
    if (activeMode === "talk") {
      return `Talk Status: ${talkConversation.status}`;
    } else if (activeMode === "meeting") {
      return `Meeting Status: ${meetingConversation.status}`;
    }
    return "Status: disconnected";
  };

  const getMicrophoneButtonStyle = () => {
    const isConnected = conversation.status === "connected";
    const isSpeaking = conversation.isSpeaking;

    if (activeMode === "chat") {
      // In chat mode, mic button is disabled/different style
      return "w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center opacity-50 cursor-not-allowed shadow-lg";
    }

    if (isConnected) {
      return isSpeaking
        ? "w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg animate-pulse"
        : "w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg";
    }

    // Different colors for different modes when not connected
    const modeColors = {
      talk: "from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      meeting: "from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700",
    };

    return `w-16 h-16 rounded-full bg-gradient-to-br ${
      modeColors[activeMode] || modeColors.talk
    } flex items-center justify-center transition-all transform hover:scale-105 shadow-lg`;
  };

  // Handle mode switching with proper cleanup
  const handleModeSwitch = async (newMode) => {
    // End any active conversations before switching modes
    if (talkConversation.status === "connected") {
      await talkConversation.endSession();
    }
    if (meetingConversation.status === "connected") {
      await meetingConversation.endSession();
    }

    setActiveMode(newMode);
  };

  return (
    <div className="p-6 flex flex-1 flex-col justify-center">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">{currentMode.title}</h3>
        <p className="text-slate-500 text-sm">{getConnectionStatus()}</p>
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleMicrophoneClick}
          disabled={activeMode === "chat"}
          className={getMicrophoneButtonStyle()}>
          <Mic
            size={24}
            className="text-white"
          />
        </button>
      </div>

      <p className="text-center text-slate-500 text-sm mb-8">{currentMode.instruction}</p>

      {/* Chat Input (only show in chat mode) */}
      {activeMode === "chat" && (
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-white/50 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleModeSwitch("talk")}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm text-sm font-medium ${
            activeMode === "talk"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}>
          <MessageCircle size={16} />
          Talk
        </button>

        <button
          onClick={() => handleModeSwitch("meeting")}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm text-sm font-medium ${
            activeMode === "meeting"
              ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}>
          <Users size={16} />
          Meeting
        </button>

        <button
          onClick={() => handleModeSwitch("chat")}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm text-sm font-medium ${
            activeMode === "chat"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}>
          <MessageCircle size={16} />
          Chat
        </button>
      </div>
    </div>
  );
}
