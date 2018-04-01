export const roomsTypeDef = `

type Room {
    IdRoom: Int!
    NameRoom: String!
    DescriptionRoom: String
    IdOwner: Int!
    participants: [Participant]
}

type Participant {
    Id: Int!
    IdRoom: Int!
    IdParticipant: Int!
}

input RoomInput {
    IdRoom: Int
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
