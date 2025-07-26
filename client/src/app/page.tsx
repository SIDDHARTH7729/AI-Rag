import ChatComponent from "@/components/chat";
import FileUpload from "@/components/FileUpload";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Glassmorphism */}
      <div className="relative w-full backdrop-blur-sm bg-white/30 border-b border-white/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative w-full flex justify-center items-center py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              AI RAG Assistant
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Intelligent Document Analysis & Conversation
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 h-[calc(100vh-140px)] gap-1">
        {/* Left Panel - File Upload */}
        <div className="w-[35%] min-h-full p-6 flex flex-col">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-full flex flex-col">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Upload</h2>
              <p className="text-gray-600">Upload your PDF to start analyzing</p>
            </div>
            <div className="flex-1 flex justify-center items-center p-6">
              <FileUpload />
            </div>
          </div>
        </div>
        
        {/* Right Panel - Chat */}
        <div className="w-[65%] bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col m-6 ml-0">
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">AI Conversation</h2>
            <p className="text-gray-600">Ask questions about your uploaded documents</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatComponent />
          </div>
        </div>
      </div>
    </div>
  );
}