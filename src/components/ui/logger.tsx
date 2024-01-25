import React, { useState, useRef, useEffect } from "react";

interface LoggerProps {
  messages: string[];
}

const Logger: React.FC<LoggerProps> = ({ messages }) => {
  const loggerRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    // Auto-scroll to the bottom only if the scroll bar is at the bottom
    if (shouldAutoScroll && loggerRef.current) {
      loggerRef.current.scrollTop = loggerRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    // Check if the user has scrolled to the bottom
    if (!loggerRef.current) return;
    const isAtBottom =
      loggerRef.current?.scrollHeight - (loggerRef.current?.scrollTop || 0) ===
      (loggerRef.current?.clientHeight || 0);

    // Update shouldAutoScroll based on whether the user has manually scrolled up
    setShouldAutoScroll(isAtBottom);
  };

  return (
    <div
      ref={loggerRef}
      className="logger-container w-[100%]"
      onScroll={handleScroll}
      style={{ maxHeight: "90%", overflowY: "auto" }} // Set your own styling
    >
      {messages.map((message, index) => (
        <div key={index} className="log-message text-xs w-[100%]">
          {message}
        </div>
      ))}
    </div>
  );
};

export default Logger;
