export const sessionsTypeDef = `
type User{
    id: Int!
    email: String!
    provider: String!
    name: String!
    nickname: String!
    image: String
}

type LoginData{
    id: Int!
    email: String!
    name: String!
    nickname: String!
    image: String
    token: String!
    type: String!
    client: String!
}

type Data{
    data: User! 
}

type Success{
    success: String! 
}

input SessionInput {
    email: String!
    password: String!
}

input Headers {
    uid: String!
    token: String!
    client: String!
}
`;

export const sessionsQueries = `
    userById(id: Int!): Data!
    validateSession(headersSession: Headers!): LoginData!
`;

export const sessionsMutations = `
    createSession(session: SessionInput!): LoginData!
    deleteSession(headersSession: Headers!): Success!
`;
