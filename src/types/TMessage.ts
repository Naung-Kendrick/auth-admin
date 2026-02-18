export type TMessage = {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type TMessageRes = {
  success: boolean;
  message: TMessage;
};

export type TGetMessagesRes = {
  success: boolean;
  messages: TMessage[];
};