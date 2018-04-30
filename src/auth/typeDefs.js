export const authTypeDef = `
    type Auth {
        email: String!
        password: String!
        answer: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }
    
    type LoginData {
        id: Int!
        email: String!
        name: String!
        nickname: String!
        image: String
        token: String!
        type: String!
        client: String!
    }
`;

export const authMutations = `
    createSession(session: AuthInput!): LoginData!
`;