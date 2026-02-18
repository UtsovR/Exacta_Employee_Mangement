/**
 * Lightweight API helper around fetch with consistent auth/error handling.
 */
export const apiRequest = async (
    path,
    {
        method = 'GET',
        token,
        body,
        query,
        headers = {},
    } = {}
) => {
    const queryString = query
        ? new URLSearchParams(
            Object.entries(query).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = String(value);
                }
                return acc;
            }, {})
        ).toString()
        : '';

    const url = queryString ? `${path}?${queryString}` : path;
    const requestHeaders = {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
    };

    const response = await fetch(url, {
        method,
        headers: requestHeaders,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const raw = await response.text();
    let data = null;

    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch (_error) {
            data = raw;
        }
    }

    if (!response.ok) {
        const message =
            (data && typeof data === 'object' && data.message) ||
            `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data;
};
