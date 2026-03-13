export interface Message {
  id: string;
  sender: string;
  text: string;
  roomId: string;
  createdAt: number;
  readBy: Record<string, number>;
}

export interface BurnState {
  messageId: string;
  readAt: number;
  secondsLeft: number;
  burning: boolean;
}
