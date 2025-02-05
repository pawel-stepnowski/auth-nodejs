import { AuthenticationException } from "../AuthenticationException.js";
import { Provider } from "./Provider.js";

/** @typedef {import("@liquescens/auth-nodejs").IdentityInfo} IdentityInfo */

export class Microsoft extends Provider
{
    /**
     * @override
     * @param {string} authorization_code
     * @param {string} redirect_uri
     * @returns {Promise<Response>}
     */
    async _fetchAccessToken(authorization_code, redirect_uri)
    {
        try
        {
            const { token_uri, client_id, client_secret } = this.configuration.access_token;
            const body = 
            {
                grant_type: 'authorization_code',
                code: authorization_code,
                redirect_uri,
                client_id,
                client_secret,
                scope: "https://graph.microsoft.com/.default"
            };
            return await fetch(token_uri,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(body).toString()
            });
        }
        catch
        {
            throw new AuthenticationException('token', 'TODO');
        }
    }

    /**
     * @param {Response} response
     * @returns {Promise<import("./Provider.js").IdentityInfo & { raw: string }>}
     */
    async _parseIdentity(response)
    {
        const content_type = response.headers.get('content-type');
        if (content_type?.startsWith('application/json'))
        {
            const raw = await response.text();
            const data = JSON.parse(raw);
            // from endpoint: https://graph.microsoft.com/v1.0/me
            if (data['@odata.context'] === 'https://graph.microsoft.com/v1.0/$metadata#users/$entity')
            {
                const id = data.id;
                const mail = data.mail;
                const display_name = data.displayName;
                return { id, mail, display_name, raw };
            }
            else throw new Error('Parsing identity error. Invalid odata context.');
        }
        else throw new Error('Parsing identity error. Invalid content type of the server response.');
    }
}
