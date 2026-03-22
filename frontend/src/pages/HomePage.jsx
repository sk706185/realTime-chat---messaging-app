import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { io } from "socket.io-client";

let socket;

const HomePage = () => {
  const { authUser, logout } = useAuthStore();
  const {
    users, messages, selectedUser,
    getUsers, getMessages, sendMessage,
    addMessage, setSelectedUser,
  } = useChatStore();

  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Connect socket
  useEffect(() => {
    if (!authUser) return;
    socket = io("http://localhost:5000", {
      query: { userId: authUser._id },
    });

    socket.on("getOnlineUsers", (users) => setOnlineUsers(users));
    socket.on("newMessage", (message) => addMessage(message));

    return () => socket.disconnect();
  }, [authUser]);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage({ text });
    setText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold">💬 ChatFlow</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500"
          >
            Logout
          </button>
        </div>
        <div className="p-3 text-xs text-gray-400 font-semibold uppercase">
          Users
        </div>
        <div className="overflow-y-auto flex-1">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                selectedUser?._id === user._id ? "bg-gray-100" : ""
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600">
                  {user.fullName[0]}
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{user.fullName}</p>
                <p className="text-xs text-gray-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Logged in user */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm font-medium">{authUser?.fullName}</p>
          <p className="text-xs text-gray-400">{authUser?.email}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600">
                {selectedUser.fullName[0]}
              </div>
              <div>
                <p className="font-semibold">{selectedUser.fullName}</p>
                <p className="text-xs text-gray-400">
                  {onlineUsers.includes(selectedUser._id) ? "🟢 Online" : "⚫ Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderId === authUser._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      msg.senderId === authUser._id
                        ? "bg-gray-800 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="bg-white border-t px-6 py-4 flex gap-3"
            >
              <input
                type="text"
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                type="submit"
                className="bg-gray-800 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-700 transition"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-lg font-medium">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;