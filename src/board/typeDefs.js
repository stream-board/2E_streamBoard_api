export const boardTypeDef = `
    input BoardRoomInput {
        id: Int!
        admin: String!
    }
    type BoardRoom {
        id: Int!
    }
`;

export const boardMutations = `
    createBoardRoom(room: BoardRoomInput!): BoardRoom!
`;
