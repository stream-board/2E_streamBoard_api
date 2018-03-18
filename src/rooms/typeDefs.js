export const roomsTypeDef = `

type Room {
    Id: Int!
    NameRoom: String!
    DescriptionRoom: String
    IdOwner: Int!
    participants: [Int]
}

input RoomInput {
    Id: Int
    NameRoom: String
    DescriptionRoom: String
    IdOwner: Int!
}
`;

export const roomsQueries = `
    allRooms: [Room]!
    roomById(id: Int!): Room!
`;

export const roomsMutations = `
    createRoom(room: RoomInput!): Room!
`;
