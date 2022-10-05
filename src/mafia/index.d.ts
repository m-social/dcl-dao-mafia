// /// <reference lib="es2015.symbol" />
// /// <reference lib="es2015.symbol.wellknown" />
// /// <reference lib="es2015.promise" />
// /// <reference lib="es2015.collection" />
// /// <reference lib="es2015.iterable" />
// /// <reference lib="es2016.array.include" />

// /*! *****************************************************************************
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
// WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
// MERCHANTABLITY OR NON-INFRINGEMENT.

// See the Apache Version 2.0 License for specific language governing permissions
// and limitations under the License.
// ***************************************************************************** */

// /**
//  * Recursively unwraps the "awaited type" of a type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
//  */
// type Awaited<T> = T extends null | undefined
//   ? T // special case for `null | undefined` when not in `--strictNullChecks` mode
//   : T extends object & { then(onfulfilled: infer F): any } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
//   ? F extends (value: infer V, ...args: any) => any // if the argument to `then` is callable, extracts the first argument
//     ? Awaited<V> // recursively unwrap the value
//     : never // the argument to `then` was not callable
//   : T // non-object or non-thenable
