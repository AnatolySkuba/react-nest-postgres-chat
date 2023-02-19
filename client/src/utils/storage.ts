export const storage = {
    set<T>(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get<T>(key: string): T | null {
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) as string) : null;
    },
};
