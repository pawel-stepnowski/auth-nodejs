import { Provider } from "./Provider.js";

export class GitHub extends Provider
{
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
            const id = data.id;
            const mail = data.login;
            const display_name = data.login;
            return { id, mail, display_name, raw };
        }
        else throw new Error('Parsing identity error. Invalid content type of the server response.');
    }
}