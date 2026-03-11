declare const _default: () => {
    port: number;
    nodeEnv: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    bcrypt: {
        rounds: number;
    };
    cors: {
        origin: string | string[];
    };
    swagger: {
        enabled: boolean;
        path: string;
    };
};
export default _default;
