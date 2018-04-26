/*
* Suites（测试程序组）：describe
*   Suites直接调用Jasmine的全局函数describe()并传递两个参数：string和function。
*   字符串表示被测试的Suites的名称或者标题。而函数则是需要实现Suites的代码块。
* Specs（测试程序体）：it
*   Specs通过调用全局函数it()来定义，跟describe类似的传递两个参数：string和function。
*   字符串是spec的标题，function是测试程序或者测试代码。Spe包括一个或多个测试代码的
*   状态期望值（expectations）。Expectations在Jasmine中是一个要么是真要么是假的断言。
*   只有当spec中的断言都为真才可以通过这个测试程序，否则测试返回failing。
* Expectations(状态期望值)：expect
*   Expectations是函数expect()建立的，而expect()函数传递一个称为actual（实际值）的参数。
*   Expectations链式的连接着传递参数expected（期望值）的Matcher函数。
* Matchers
*
* */
var Seed = require('../src/index');
describe('Seed', function () {
    it('should have a create method', function () {
        expect(Seed.create).toBe(Function);
    })
})