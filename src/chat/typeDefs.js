export const chatTypeDef = `
type ChatRoom {
    id: Int!
}

type ChatMessage {
    message: String!,
    sender: String!,
}
`;

export const chatQueries = `
    chatMsgByRoomId(id: Int!): [ChatMessage]!
`;

export const chatMutations = `
    createChatRoom(id: Int!): ChatRoom!,
    deleteChatRoom(id: Int!): ChatRoom!
`;
