/**
 * @param {*} value
 */
export function isNotStringOrWhitespace(value)
{
    return typeof value === 'string' ? value.match(/^\s*$/) : true;
}