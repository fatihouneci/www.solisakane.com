import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MeetingParticipant {
  id: string;
  name: string;
  avatar?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
}

interface Meeting {
  id: string;
  participants: MeetingParticipant[];
  isActive: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  chatId?: string;
}

interface MeetingContextType {
  currentMeeting: Meeting | null;
  isInMeeting: boolean;
  startMeeting: (chatId?: string) => void;
  joinMeeting: (meetingId: string) => void;
  leaveMeeting: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  addParticipant: (participant: MeetingParticipant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<MeetingParticipant>) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};

interface MeetingProviderProps {
  children: ReactNode;
}

export const MeetingProvider: React.FC<MeetingProviderProps> = ({ children }) => {
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);

  const startMeeting = (chatId?: string) => {
    const meetingId = `meeting_${Date.now()}`;
    const meeting: Meeting = {
      id: meetingId,
      participants: [],
      isActive: true,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      chatId
    };
    
    setCurrentMeeting(meeting);
    setIsInMeeting(true);
  };

  const joinMeeting = (meetingId: string) => {
    // Implementation for joining an existing meeting
    const meeting: Meeting = {
      id: meetingId,
      participants: [],
      isActive: true,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false
    };
    
    setCurrentMeeting(meeting);
    setIsInMeeting(true);
  };

  const leaveMeeting = () => {
    setCurrentMeeting(null);
    setIsInMeeting(false);
  };

  const toggleVideo = () => {
    if (currentMeeting) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        isVideoEnabled: !prev.isVideoEnabled
      } : null);
    }
  };

  const toggleAudio = () => {
    if (currentMeeting) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        isAudioEnabled: !prev.isAudioEnabled
      } : null);
    }
  };

  const toggleScreenShare = () => {
    if (currentMeeting) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        isScreenSharing: !prev.isScreenSharing
      } : null);
    }
  };

  const addParticipant = (participant: MeetingParticipant) => {
    if (currentMeeting) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        participants: [...prev.participants, participant]
      } : null);
    }
  };

  const removeParticipant = (participantId: string) => {
    if (currentMeeting) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        participants: prev.participants.filter(p => p.id !== participantId)
      } : null);
    }
  };

  const updateParticipant = (participantId: string, updates: Partial<MeetingParticipant>) => {
    if (currentMeeting) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId ? { ...p, ...updates } : p
        )
      } : null);
    }
  };

  const value: MeetingContextType = {
    currentMeeting,
    isInMeeting,
    startMeeting,
    joinMeeting,
    leaveMeeting,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    addParticipant,
    removeParticipant,
    updateParticipant
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
};
