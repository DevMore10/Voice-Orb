import { useState, useCallback, useRef } from "react";
import { Mic, MessageCircle, Users, Send, Paperclip, X, FileText, Image, File } from "lucide-react";
import { useConversation } from "@elevenlabs/react";

export default function VoicePanel() {
  const [activeMode, setActiveMode] = useState("talk");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const WEBHOOK_URL = `${import.meta.env.VITE_WEBHOOK_URL || " "}`;

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

  const modeConfig: any = {
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

  // File type detection helpers
  const getFileIcon = (file: any) => {
    const fileType = file.type.toLowerCase();
    if (fileType.includes("image"))
      return (
        <Image
          size={16}
          className="text-blue-500"
        />
      );
    if (fileType.includes("pdf"))
      return (
        <FileText
          size={16}
          className="text-red-500"
        />
      );
    if (fileType.includes("csv") || fileType.includes("spreadsheet"))
      return (
        <FileText
          size={16}
          className="text-green-500"
        />
      );
    return (
      <File
        size={16}
        className="text-gray-500"
      />
    );
  };

  const formatFileSize = (bytes: any) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Text chat API call
  const sendTextMessage = async (message: any, attachments = []) => {
    const formData = new FormData();
    formData.append("message", message);

    attachments.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    try {
      console.log(formData);
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.message || result.response || result.reply || "Message sent successfully";
    } catch (error) {
      console.error("Text chat error:", error);
      throw error;
    }
  };

  // Handle file selection
  const handleFileSelect = (event: any) => {
    const files: any = Array.from(event.target.files);
    const validFiles = files.filter((file) => {
      // Accept common file types
      const validTypes = [
        "application/pdf",
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const maxSize = 10 * 1024 * 1024; // 10MB limit

      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      if (!validTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported.`);
        return false;
      }

      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment
  const removeAttachment = (index: any) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle message sending
  const handleSendMessage = async () => {
    if (!chatMessage.trim() && attachments.length === 0) return;

    const messageToSend = chatMessage.trim();
    const attachmentsToSend = [...attachments];

    // Add user message to history
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageToSend,
      attachments: attachmentsToSend.map((file: any) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatMessage("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await sendTextMessage(messageToSend, attachmentsToSend);

      // Add AI response to history
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response,
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Add error message to history
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: "Failed to send message. Please try again.",
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle Talk mode conversation
  const handleTalkMode = useCallback(async () => {
    if (talkConversation.status === "connected") {
      await talkConversation.endSession();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
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
      await meetingConversation.endSession();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await meetingConversation.startSession({
          agentId: "agent_01jwp8q782f9jsg9zxej1qhdde",
        });
      } catch (error) {
        console.error("Failed to start meeting conversation:", error);
        alert("Failed to start meeting. Please check your microphone permissions.");
      }
    }
  }, [meetingConversation]);

  const handleMicrophoneClick = () => {
    if (activeMode === "talk") {
      handleTalkMode();
    } else if (activeMode === "meeting") {
      handleMeetingMode();
    }
  };

  const getConnectionStatus = () => {
    if (activeMode === "talk") {
      return `Talk Status: ${talkConversation.status}`;
    } else if (activeMode === "meeting") {
      return `Meeting Status: ${meetingConversation.status}`;
    }
    return `Chat Messages: ${chatHistory.length}`;
  };

  const getMicrophoneButtonStyle = () => {
    const isConnected = conversation.status === "connected";
    const isSpeaking = conversation.isSpeaking;

    if (activeMode === "chat") {
      return "w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center opacity-50 cursor-not-allowed shadow-lg";
    }

    if (isConnected) {
      return isSpeaking
        ? "w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg animate-pulse"
        : "w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg";
    }

    const modeColors = {
      talk: "from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      meeting: "from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700",
    };

    return `w-16 h-16 rounded-full bg-gradient-to-br ${
      modeColors[activeMode] || modeColors.talk
    } flex items-center justify-center transition-all transform hover:scale-105 shadow-lg`;
  };

  // Handle mode switching with proper cleanup
  const handleModeSwitch = async (newMode: any) => {
    if (talkConversation.status === "connected") {
      await talkConversation.endSession();
    }
    if (meetingConversation.status === "connected") {
      await meetingConversation.endSession();
    }

    setActiveMode(newMode);
  };

  return (
    <div className="p-6 flex flex-1 flex-col justify-center max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">{currentMode.title}</h3>
        <p className="text-slate-500 text-sm">{getConnectionStatus()}</p>
      </div>

      {/* Chat History (only show in chat mode) */}
      {activeMode === "chat" && (
        <div className="mb-6 max-h-96 overflow-y-auto bg-white rounded-xl border border-slate-200 p-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <MessageCircle
                size={48}
                className="mx-auto mb-4 opacity-50"
              />
              <p>Start a conversation with Kiaan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : message.type === "error"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-slate-100 text-slate-800"
                    }`}>
                    {message.content && <p className="text-sm">{message.content}</p>}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs opacity-90">
                            {getFileIcon(file)}
                            <span className="truncate">{file.name}</span>
                            <span>({formatFileSize(file.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                      <span className="text-sm">Kiaan is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Microphone Button (for Talk and Meeting modes) */}
      {activeMode !== "chat" && (
        <div className="flex justify-center mb-8">
          <button
            onClick={handleMicrophoneClick}
            className={getMicrophoneButtonStyle()}>
            <Mic
              size={24}
              className="text-white"
            />
          </button>
        </div>
      )}

      {activeMode !== "chat" && (
        <p className="text-center text-slate-500 text-sm mb-8">{currentMode.instruction}</p>
      )}

      {/* Chat Input (only show in chat mode) */}
      {activeMode === "chat" && (
        <div className="mb-6">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-slate-200">
                    {getFileIcon(file)}
                    <span className="text-sm text-slate-700 truncate max-w-32">{file.name}</span>
                    <span className="text-xs text-slate-500">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-white/50 transition-colors disabled:opacity-50"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                <Paperclip size={18} />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!chatMessage.trim() && attachments.length === 0) || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
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
