export const sessionsTypeDef = `
type User{
    id: Int!
    email: String!
    provider: String!
    uid: String!
    name: String!
    nickname: String!
    image: String
}

type Data{
    data: User! 
}

input SessionInput {
    email: String!
    password: String!
}
`;

export const sessionsQueries = `
    userById(id: Int!): Data!
`;

export const sessionsMutations = `
    createSession(session: SessionInput!): Data!
`;
