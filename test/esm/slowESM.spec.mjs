// // simulate slow `import()`, slow toplevel await
// await new Promise((resolve)=>{
//     setTimeout(()=>{
//         resolve(undefined)
//     }, 2000)
// })
const mod = 1

describe('slowESM', function () {
    it('1 + 1 = 2', function () {
        // defined by karma.conf.js rootHooks
        // defined by test/esm/mochaHooks.mjs
        window.__UNIT_TESTS__.push('slowESM')

        expect(mod + 1).to.eq(2)
    })
})

// ensure in ESM context
export default import.meta.url