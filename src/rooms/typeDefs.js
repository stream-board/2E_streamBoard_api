export const roomsTypeDef = `

type Room {
    idRoom: Int!
    nameRoom: String!
    descriptionRoom: String
    categoryRoom: String!
    owner: User
    Participants: [User]
}

type Participant {
    id: Int!
    idRoom: Int!
    idParticipant: Int!
}

input CreateRoomInput {
    nameRoom: String
    descriptionRoom: String
    categoryRoom: String!
    idOwner: Int!
}

input JoinRoomInput {
    idRoom: Int!
    idOwner: Int!
}

input RoomDelete {
  idRoom: Int!,
  idOwner: Int!
}
`;

export const roomsQueries = `
    allRooms: [Room]!
    roomById(id: Int!): Room!
`;

export const roomsMutations = `
    createRoom(room: CreateRoomInput!): Room!
    joinRoom(room: JoinRoomInput!): Room!
    deleteRoom(roomDelete: RoomDelete!): Room!
    exitRoom(roomDelete: RoomDelete): Room!
`;
