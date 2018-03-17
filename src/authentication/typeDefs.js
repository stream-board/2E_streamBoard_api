export const sessionsTypeDef = `
/*type Session {
    id: Integer!
    email: String!
    provider: String!
    uid: String!
    name: String!
    nickname: String!
    image: String
}*/

input SessionInput {
    email: String!
    password: String!
}
`;

export const sessionsMutations = `
    createSession(session: SessionInput!): Session!
`;
