export const chatTypeDef = `
type ChatRoom {
    id: Int!
}

type ChatMessage {
    id: Int!
    message: String!,
    sender: String!,
}

input ChatRoomInput {
    id: Int!
}
`;

export const chatQueries = `
    chatMsgByRoomId(id: Int!): [ChatMessage]!
`;

export const chatMutations = `
    createChatRoom(chatRoom: ChatRoomInput!): ChatRoom!,
    deleteChatRoom(id: Int!): ChatRoom!
`;
