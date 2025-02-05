import { AuthenticationException } from "../AuthenticationException.js";

/** @typedef {import("@liquescens/auth-nodejs").IdentityInfo} IdentityInfo */
/** @typedef {import("@liquescens/auth-nodejs").OAuth2.ProviderConfiguration} ProviderConfiguration */

/**
 * @abstract
 */
export class Provider
{
    /**
     * @param {ProviderConfiguration} configuration
     */
    constructor(configuration)
    {
        this.configuration = configuration;
    }

    /**
     * @param {string} authorization_code
     * @param {string} redirect_uri
     * @returns {Promise<string>}
     */
    async fetchAccessToken(authorization_code, redirect_uri)
    {
        if (typeof authorization_code !== 'string') throw new AuthenticationException('authorization_code', 'Authorization code is not of type string.');
        const token_response = await this._fetchAccessToken(authorization_code, redirect_uri);
        const { access_token } = await this._parseAccessToken(token_response);
        return access_token;
    }

    /**
     * @param {string} access_token
     * @returns {Promise<IdentityInfo & { raw: string; }>}
     */
    async fetchUserInfo(access_token)
    {
        if (typeof access_token !== 'string') throw new AuthenticationException('token', 'Access token is not of type string.');
        const identity_response = await this._fetchIdentity(access_token);
        const identity = await this._parseIdentity(identity_response);
        this._validateIdentity(identity);
        return identity;
    }

    /**
     * @param {string} authorization_code
     * @param {string} redirect_uri
     * @returns {Promise<Response>}
     */
    async _fetchAccessToken(authorization_code, redirect_uri)
    {
        const { token_uri, client_id, client_secret } = this.configuration.access_token;
        const body = 
        {
            grant_type: 'authorization_code',
            code: authorization_code,
            redirect_uri,
            client_id,
            client_secret
        };
        return await fetch(token_uri,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(body).toString()
        });
    }

    /**
     * @param {string} access_token
     * @returns {Promise<Response>}
     */
    async _fetchIdentity(access_token)
    {
        const { uri, token_pass_method } = this.configuration.user_info;
        if (token_pass_method === 'query')
        {
            return await fetch(`${uri}?${new URLSearchParams({ access_token })}`);
        }
        else
        {
            return await fetch(`${uri}`, { headers: { Authorization: `Bearer ${access_token}` } });
        }
    }

    /**
     * @param {Response} response
     * @returns {Promise<{ access_token: string }>}
     */
    async _parseAccessTokenInURLEncodedFormat(response)
    {
        const text = await response.text();
        const data = new URLSearchParams(text);
        const access_token = data.get('access_token');
        if (access_token) return { access_token };
        const error = data.get('error') ? `(${data.get('error')})` : '';
        const error_description =  data.get('error_description') ?? '';
        const message = ['Error parsing access token.'];
        if (error || error_description) message.push(`${error_description} ${error}`);
        throw new AuthenticationException('token', message.join(' '));
    }

    /**
     * @param {Response} response
     * @returns {Promise<{ access_token: string }>}
     */
    async _parseAccessTokenInJSONFormat(response)
    {
        const text = await response.text();
        const data = JSON.parse(text);
        const access_token = data.access_token;
        if (access_token) return { access_token };
        const error = data.error ? `(${data.error})` : '';
        const error_description =  data.error_description ?? '';
        const message = ['Error parsing access token.'];
        if (error || error_description) message.push(`${error_description} ${error}`);
        throw new AuthenticationException('token', message.join(' '));
    }

    /**
     * @param {Response} response
     * @returns
     */
    async _parseAccessToken(response)
    {
        const content_type = response.headers.get('content-type');
        if (content_type?.startsWith('application/x-www-form-urlencoded')) return this._parseAccessTokenInURLEncodedFormat(response);
        if (content_type?.startsWith('application/json')) return this._parseAccessTokenInJSONFormat(response);
        return this._parseAccessTokenInJSONFormat(response);
    }

    /**
     * @param {Response} response
     * @returns {Promise<IdentityInfo & { raw: string }>}
     */
    async _parseIdentity(response)
    {
        throw new Error('Not implemented.');
    }

    /**
     * @param {IdentityInfo & { raw: string }} identity
     */
    _validateIdentity(identity)
    {
    }
}
