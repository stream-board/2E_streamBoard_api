export const roomsTypeDef = `

type Room {
    idRoom: Int!
    nameRoom: String!
    descriptionRoom: String
    idOwner: Int!
    Participants: [Participant]
}

type Participant {
    Id: Int!
    IdRoom: Int!
    IdParticipant: Int!
}

input CreateRoomInput {
    nameRoom: String
    descriptionRoom: String
    idOwner: Int!
}

input JoinRoomInput {
    idRoom: Int!
    idUser: Int!
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
`;
