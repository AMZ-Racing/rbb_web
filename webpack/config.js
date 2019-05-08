/*
 * AMZ-Driverless
 * Copyright (c) 2019 Authors:
 *   - Huub Hendrikx <hhendrik@ethz.ch>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const webpack = require('webpack');

module.exports = function configPlugin(Configuration, env) {
    return new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env),

        '__CONFIG__.API_PATH': Configuration.API_PATH,
        '__CONFIG__.API_TOKEN_COOKIE': Configuration.API_TOKEN_COOKIE,
        '__CONFIG__.API_TOKEN_COOKIE_DOMAIN': Configuration.API_TOKEN_COOKIE_DOMAIN,
        '__CONFIG__.API_SECURE': Configuration.API_SECURE,
        '__CONFIG__.VERSION_MINOR': Configuration.VERSION_MINOR,
        '__CONFIG__.VERSION_MAJOR': Configuration.VERSION_MAJOR,
        '__CONFIG__.VERSION_REVISION': Configuration.VERSION_REVISION,
        '__CONFIG__.DEVELOPMENT': Configuration.DEVELOPMENT,
    })
}
