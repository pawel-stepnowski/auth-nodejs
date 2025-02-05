
export class AuthenticationError extends Error
{
    /**
     * @param {'authorization_code' | 'token' | 'userinfo'} category 
     * @param {string} message 
     */
    constructor(category, message)
    {
        super(message);
        this.category = category;
    }
}
