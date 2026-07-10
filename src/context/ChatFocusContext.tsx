import React, { createContext, useContext, useState } from 'react';

interface ChatFocusContextType {
  isChatInputFocused: boolean;
  setIsChatInputFocused: (focused: boolean) => void;
}

const ChatFocusContext = createContext<ChatFocusContextType | undefined>(undefined);

export const ChatFocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);

  return (
    <ChatFocusContext.Provider value={{ isChatInputFocused, setIsChatInputFocused }}>
      {children}
    </ChatFocusContext.Provider>
  );
};

export const useChatFocus = () => {
  const context = useContext(ChatFocusContext);
  if (context === undefined) {
    throw new Error('useChatFocus must be used within a ChatFocusProvider');
  }
  return context;
};
