"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import BotAvatar from "../../../public/images/bot-avatar.png";
import Image from "next/image";
import ChatHeader from "@/components/ui/chat/header";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const App: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{
      id: number;
      text: string;
      sender: "ai" | "user";
      liked: boolean;
      time: string;
    }>
  >([
    {
      id: 1,
      text: "Hi there! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      liked: false,
      time: "10:00 AM",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newUserMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user" as const,
      liked: false,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage("");

    // Simulate Message
    // setIsTyping(true);
    // setTimeout(() => {
    //   const aiResponse = {
    //     id: messages.length + 2,
    //     text: `Thanks for your message! I'm processing your request about "${inputMessage.substring(
    //       0,
    //       30
    //     )}${inputMessage.length > 30 ? "..." : ""}"`,
    //     sender: "ai" as const,
    //     liked: false,
    //     time: new Date().toLocaleTimeString([], {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //     }),
    //   };
    //   setMessages((prev) => [...prev, aiResponse]);
    //   setIsTyping(false);
    // }, 2000);

    // simulate Message from SSE
    getMessageFromSSE();
  };

  const getMessageFromSSE = async () => {
    let aiResponseId = messages.length + 2;
    let buffer = "";

    await fetchEventSource("/api/sse", {
      method: "POST",
      body: JSON.stringify({ input: inputMessage }),
      headers: { "Content-Type": "application/json" },

      onopen: async () => {
        setMessages((prev) => [
          ...prev,
          {
            id: aiResponseId,
            text: "",
            sender: "ai",
            liked: false,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      },

      onmessage: (ev) => {
        const { content, done } = JSON.parse(ev.data);

        buffer += content;
        const characters = buffer.split("");
        buffer = "";

        characters.forEach((char, index) => {
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiResponseId
                  ? { ...msg, text: msg.text + char }
                  : msg
              )
            );
          }, index * 30);
        });
      },

      onclose: () => {
        setIsTyping(false);
        buffer = "";
      },

      onerror: (err) => {
        console.error("SSE error:", err);
        setIsTyping(false);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <ChatHeader />
      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 pl-12 space-y-4"
        style={{
          backgroundImage: `url('/images/chat-bg.png')`,
          backgroundSize: "cover",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            <div
              className={`relative max-w-[80%] md:max-w-[70%] p-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md group
                ${
                  message.sender === "user"
                    ? "bg-purple-500 text-white rounded-tr-none animate-slideInRight"
                    : "bg-white rounded-tl-none animate-slideInLeft"
                }`}
            >
              {message.sender === "ai" && (
                <div className="w-8 h-8 rounded-full overflow-hidden absolute -left-10 top-0">
                  <Image
                    src={BotAvatar}
                    alt="AI"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm md:text-base">{message.text}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs opacity-70">{message.time}</span>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] md:max-w-[70%] animate-fadeIn">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-fadeIn hover:bg-purple-600 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
        >
          <i className="fa fa-arrow-down"></i>
        </button>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white bg-opacity-90 backdrop-blur-md border-t border-purple-100 shadow-inner">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything!"
              className="w-full px-4 py-3 pr-12 border-none rounded-full bg-purple-50 focus:ring-2 focus:ring-purple-300 outline-none resize-none max-h-32 transition-all"
              style={{ minHeight: "50px" }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center hover:scale-110 transition-all shadow-md cursor-pointer !rounded-button whitespace-nowrap"
          >
            <Send />
          </button>
        </div>

        <div className="flex justify-center mt-2 text-xs text-gray-500">
          <button className="mx-1 hover:text-purple-500 transition-colors cursor-pointer !rounded-button whitespace-nowrap">
            <i className="fa fa-image mr-1"></i> Images
          </button>
          <span className="mx-1">•</span>
          <button className="mx-1 hover:text-purple-500 transition-colors cursor-pointer !rounded-button whitespace-nowrap">
            <i className="fa fa-file mr-1"></i> Files
          </button>
          <span className="mx-1">•</span>
          <button className="mx-1 hover:text-purple-500 transition-colors cursor-pointer !rounded-button whitespace-nowrap">
            <i className="fa fa-smile-o mr-1"></i> Emoji
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out forwards;
        }

        .typing-text {
          display: inline-block;
          overflow: hidden;
          border-right: 2px solid #888;
          white-space: pre-wrap;
          animation: typing 1s steps(40, end),
            blink-caret 0.75s step-end infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
