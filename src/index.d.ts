declare module '@liquescens/auth-nodejs'
{
    export type IdentityInfo =
    {
        id: string
        mail: string
        display_name: string
    }
    export class Authentication
    {
        providers: Record<string, OAuth2.Provider>
        constructor(providers: Record<string, OAuth2.Provider>)
    }
    export class AuthenticationError extends Error
    {
        category: string
    }
    export namespace OAuth2
    {
        export type ProviderConfiguration =
        {
            access_token:
            {
                client_id: string
                client_secret: string
                token_uri: string
            }
            user_info:
            {
                uri: string, 
                token_pass_method: 'query' | 'header'
            }
        }
        export class Provider
        {
            configuration: ProviderConfiguration
            constructor(configuration: ProviderConfiguration);
            fetchAccessToken(authorization_code: string, redirect_uri: string): Promise<string>
            fetchUserInfo(access_token: string): Promise<IdentityInfo & { raw: string; }>
        }
        export class GitHub extends Provider
        {
        }
        export class Google extends Provider
        {
        }
        export class Microsoft extends Provider
        {
        }
    }
}