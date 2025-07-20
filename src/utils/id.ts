

export const createIdGenerator = (prefix: string) => {
    let counter = 0;
    return {
        gen: () => {
            counter += 1;
            return `${prefix}-${counter}`;
        },
        reset: () => {
            counter = 0;
        }
    }
}