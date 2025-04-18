import Image from "next/image";
import Bot from "@/../public/images/bot.png";

export default function ChatHeader() {
  return (
    <header className="flex flex-col items-center p-4 bg-white bg-opacity-80 backdrop-blur-sm shadow-sm z-10">
      <div className="relative w-16 h-16 mb-2 animate-bounce">
        <Image
          src={Bot}
          alt="AI Assistant"
          className="w-full h-full object-cover rounded-full shadow-md border-2 border-purple-300"
        />
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border border-white"></div>
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Cute AI Assistant
      </h1>
      <div className="flex items-center text-sm text-gray-500 mt-1">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
        AI is online and ready to chat!
      </div>
    </header>
  );
}
