export const mochaHooks = {
    beforeAll(...args) {
        window.__UNIT_TESTS__ = window.__UNIT_TESTS__ ?? [];
    },
    afterAll(...args) {
        if (!window.__UNIT_TESTS__.includes('slowESM')) {
            throw new Error(`found unit test not included`)
        }
    },
}
