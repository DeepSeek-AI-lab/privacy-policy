(function () {
  function a(b) {
    "@babel/helpers - typeof";
    return (
      (a =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (a) {
              return typeof a;
            }
          : function (a) {
              return a &&
                "function" == typeof Symbol &&
                a.constructor === Symbol &&
                a !== Symbol.prototype
                ? "symbol"
                : typeof a;
            }),
      a(b)
    );
  }
  function b() {
    "use strict";
    function c(a, b, c) {
      return (
        Object.defineProperty(a, b, {
          value: c,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        }),
        a[b]
      );
    }
    function d(a, b, c, d) {
      var e = b && b.prototype instanceof f ? b : f,
        g = Object.create(e.prototype),
        h = new o(d || []);
      return u(g, "_invoke", { value: k(a, c, h) }), g;
    }
    function e(a, b, c) {
      try {
        return { type: "normal", arg: a.call(b, c) };
      } catch (a) {
        return { type: "throw", arg: a };
      }
    }
    function f() {}
    function g() {}
    function h() {}
    function i(a) {
      ["next", "throw", "return"].forEach(function (b) {
        c(a, b, function (a) {
          return this._invoke(b, a);
        });
      });
    }
    function j(b, c) {
      function d(f, g, h, i) {
        var j = e(b[f], b, g);
        if ("throw" !== j.type) {
          var k = j.arg,
            l = k.value;
          return l && "object" == a(l) && t.call(l, "__await")
            ? c.resolve(l.__await).then(
                function (a) {
                  d("next", a, h, i);
                },
                function (a) {
                  d("throw", a, h, i);
                }
              )
            : c.resolve(l).then(
                function (a) {
                  (k.value = a), h(k);
                },
                function (a) {
                  return d("throw", a, h, i);
                }
              );
        }
        i(j.arg);
      }
      var f;
      u(this, "_invoke", {
        value: function (a, b) {
          function e() {
            return new c(function (c, e) {
              d(a, b, c, e);
            });
          }
          return (f = f ? f.then(e, e) : e());
        },
      });
    }
    function k(a, b, c) {
      var d = "suspendedStart";
      return function (f, g) {
        if ("executing" == d) throw new Error("Generator is already running");
        if ("completed" == d) {
          if ("throw" === f) throw g;
          return q();
        }
        for (c.method = f, c.arg = g; ; ) {
          var h = c.delegate;
          if (h) {
            var i = l(h, c);
            if (i) {
              if (i === z) continue;
              return i;
            }
          }
          if ("next" === c.method) c.sent = c._sent = c.arg;
          else if ("throw" === c.method) {
            if ("suspendedStart" == d) throw ((d = "completed"), c.arg);
            c.dispatchException(c.arg);
          } else "return" === c.method && c.abrupt("return", c.arg);
          d = "executing";
          var j = e(a, b, c);
          if ("normal" === j.type) {
            if (((d = c.done ? "completed" : "suspendedYield"), j.arg === z))
              continue;
            return { value: j.arg, done: c.done };
          }
          "throw" === j.type &&
            ((d = "completed"), (c.method = "throw"), (c.arg = j.arg));
        }
      };
    }
    function l(a, b) {
      var c = b.method,
        d = a.iterator[c];
      if (void 0 === d)
        return (
          (b.delegate = null),
          ("throw" === c &&
            a.iterator.return &&
            ((b.method = "return"),
            (b.arg = void 0),
            l(a, b),
            "throw" === b.method)) ||
            ("return" !== c &&
              ((b.method = "throw"),
              (b.arg = new TypeError(
                "The iterator does not provide a '" + c + "' method"
              )))),
          z
        );
      var f = e(d, a.iterator, b.arg);
      if ("throw" === f.type)
        return (b.method = "throw"), (b.arg = f.arg), (b.delegate = null), z;
      var g = f.arg;
      return g
        ? g.done
          ? ((b[a.resultName] = g.value),
            (b.next = a.nextLoc),
            "return" !== b.method && ((b.method = "next"), (b.arg = void 0)),
            (b.delegate = null),
            z)
          : g
        : ((b.method = "throw"),
          (b.arg = new TypeError("iterator result is not an object")),
          (b.delegate = null),
          z);
    }
    function m(a) {
      var b = { tryLoc: a[0] };
      1 in a && (b.catchLoc = a[1]),
        2 in a && ((b.finallyLoc = a[2]), (b.afterLoc = a[3])),
        this.tryEntries.push(b);
    }
    function n(a) {
      var b = a.completion || {};
      (b.type = "normal"), delete b.arg, (a.completion = b);
    }
    function o(a) {
      (this.tryEntries = [{ tryLoc: "root" }]),
        a.forEach(m, this),
        this.reset(!0);
    }
    function p(a) {
      if (a) {
        var b = a[w];
        if (b) return b.call(a);
        if ("function" == typeof a.next) return a;
        if (!isNaN(a.length)) {
          var c = -1,
            d = function b() {
              for (; ++c < a.length; )
                if (t.call(a, c)) return (b.value = a[c]), (b.done = !1), b;
              return (b.value = void 0), (b.done = !0), b;
            };
          return (d.next = d);
        }
      }
      return { next: q };
    }
    function q() {
      return { value: void 0, done: !0 };
    }
    b = function () {
      return r;
    };
    var r = {},
      s = Object.prototype,
      t = s.hasOwnProperty,
      u =
        Object.defineProperty ||
        function (a, b, c) {
          a[b] = c.value;
        },
      v = "function" == typeof Symbol ? Symbol : {},
      w = v.iterator || "@@iterator",
      x = v.asyncIterator || "@@asyncIterator",
      y = v.toStringTag || "@@toStringTag";
    try {
      c({}, "");
    } catch (a) {
      c = function (a, b, c) {
        return (a[b] = c);
      };
    }
    r.wrap = d;
    var z = {},
      A = {};
    c(A, w, function () {
      return this;
    });
    var B = Object.getPrototypeOf,
      C = B && B(B(p([])));
    C && C !== s && t.call(C, w) && (A = C);
    var D = (h.prototype = f.prototype = Object.create(A));
    return (
      (g.prototype = h),
      u(D, "constructor", { value: h, configurable: !0 }),
      u(h, "constructor", { value: g, configurable: !0 }),
      (g.displayName = c(h, y, "GeneratorFunction")),
      (r.isGeneratorFunction = function (a) {
        var b = "function" == typeof a && a.constructor;
        return (
          !!b && (b === g || "GeneratorFunction" === (b.displayName || b.name))
        );
      }),
      (r.mark = function (a) {
        return (
          Object.setPrototypeOf
            ? Object.setPrototypeOf(a, h)
            : ((a.__proto__ = h), c(a, y, "GeneratorFunction")),
          (a.prototype = Object.create(D)),
          a
        );
      }),
      (r.awrap = function (a) {
        return { __await: a };
      }),
      i(j.prototype),
      c(j.prototype, x, function () {
        return this;
      }),
      (r.AsyncIterator = j),
      (r.async = function (a, b, c, e, f) {
        void 0 === f && (f = Promise);
        var g = new j(d(a, b, c, e), f);
        return r.isGeneratorFunction(b)
          ? g
          : g.next().then(function (a) {
              return a.done ? a.value : g.next();
            });
      }),
      i(D),
      c(D, y, "Generator"),
      c(D, w, function () {
        return this;
      }),
      c(D, "toString", function () {
        return "[object Generator]";
      }),
      (r.keys = function (a) {
        var b = Object(a),
          c = [];
        for (var d in b) c.push(d);
        return (
          c.reverse(),
          function a() {
            for (; c.length; ) {
              var d = c.pop();
              if (d in b) return (a.value = d), (a.done = !1), a;
            }
            return (a.done = !0), a;
          }
        );
      }),
      (r.values = p),
      (o.prototype = {
        constructor: o,
        reset: function (a) {
          if (
            ((this.prev = 0),
            (this.next = 0),
            (this.sent = this._sent = void 0),
            (this.done = !1),
            (this.delegate = null),
            (this.method = "next"),
            (this.arg = void 0),
            this.tryEntries.forEach(n),
            !a)
          )
            for (var b in this)
              "t" === b.charAt(0) &&
                t.call(this, b) &&
                !isNaN(+b.slice(1)) &&
                (this[b] = void 0);
        },
        stop: function () {
          this.done = !0;
          var a = this.tryEntries[0].completion;
          if ("throw" === a.type) throw a.arg;
          return this.rval;
        },
        dispatchException: function (a) {
          function b(b, d) {
            return (
              (f.type = "throw"),
              (f.arg = a),
              (c.next = b),
              d && ((c.method = "next"), (c.arg = void 0)),
              !!d
            );
          }
          if (this.done) throw a;
          for (var c = this, d = this.tryEntries.length - 1; 0 <= d; --d) {
            var e = this.tryEntries[d],
              f = e.completion;
            if ("root" === e.tryLoc) return b("end");
            if (e.tryLoc <= this.prev) {
              var g = t.call(e, "catchLoc"),
                h = t.call(e, "finallyLoc");
              if (g && h) {
                if (this.prev < e.catchLoc) return b(e.catchLoc, !0);
                if (this.prev < e.finallyLoc) return b(e.finallyLoc);
              } else if (!g) {
                if (!h)
                  throw new Error("try statement without catch or finally");
                if (this.prev < e.finallyLoc) return b(e.finallyLoc);
              } else if (this.prev < e.catchLoc) return b(e.catchLoc, !0);
            }
          }
        },
        abrupt: function (a, b) {
          for (var c, d = this.tryEntries.length - 1; 0 <= d; --d)
            if (
              ((c = this.tryEntries[d]),
              c.tryLoc <= this.prev &&
                t.call(c, "finallyLoc") &&
                this.prev < c.finallyLoc)
            ) {
              var e = c;
              break;
            }
          e &&
            ("break" === a || "continue" === a) &&
            e.tryLoc <= b &&
            b <= e.finallyLoc &&
            (e = null);
          var f = e ? e.completion : {};
          return (
            (f.type = a),
            (f.arg = b),
            e
              ? ((this.method = "next"), (this.next = e.finallyLoc), z)
              : this.complete(f)
          );
        },
        complete: function (a, b) {
          if ("throw" === a.type) throw a.arg;
          return (
            "break" === a.type || "continue" === a.type
              ? (this.next = a.arg)
              : "return" === a.type
              ? ((this.rval = this.arg = a.arg),
                (this.method = "return"),
                (this.next = "end"))
              : "normal" === a.type && b && (this.next = b),
            z
          );
        },
        finish: function (a) {
          for (var b, c = this.tryEntries.length - 1; 0 <= c; --c)
            if (((b = this.tryEntries[c]), b.finallyLoc === a))
              return this.complete(b.completion, b.afterLoc), n(b), z;
        },
        catch: function (a) {
          for (var b, c = this.tryEntries.length - 1; 0 <= c; --c)
            if (((b = this.tryEntries[c]), b.tryLoc === a)) {
              var d = b.completion;
              if ("throw" === d.type) {
                var e = d.arg;
                n(b);
              }
              return e;
            }
          throw new Error("illegal catch attempt");
        },
        delegateYield: function (a, b, c) {
          return (
            (this.delegate = { iterator: p(a), resultName: b, nextLoc: c }),
            "next" === this.method && (this.arg = void 0),
            z
          );
        },
      }),
      r
    );
  }
  function c(a, b, c, d, e, f, g) {
    try {
      var h = a[f](g),
        i = h.value;
    } catch (a) {
      return void c(a);
    }
    h.done ? b(i) : Promise.resolve(i).then(d, e);
  }
  function d(a) {
    return function () {
      var b = this,
        d = arguments;
      return new Promise(function (e, f) {
        function g(a) {
          c(i, e, f, g, h, "next", a);
        }
        function h(a) {
          c(i, e, f, g, h, "throw", a);
        }
        var i = a.apply(b, d);
        g(void 0);
      });
    };
  }
  (function () {
    var a = document.querySelectorAll('a[href*="https://chat.openai.com/"]');
    a.forEach(function (a) {
      a.href.includes("https://chat.openai.com/") &&
        "" === a.href.split("https://chat.openai.com/")[0] &&
        a.addEventListener(
          "click",
          (function () {
            var a = d(
              b().mark(function a(c) {
                return b().wrap(function (a) {
                  for (;;)
                    switch ((a.prev = a.next)) {
                      case 0:
                        return (
                          c.preventDefault(),
                          c.stopPropagation(),
                          (a.next = 4),
                          chrome.runtime.sendMessage({
                            messageType: "OpenPopup",
                          })
                        );
                      case 4:
                      case "end":
                        return a.stop();
                    }
                }, a);
              })
            );
            return function () {
              return a.apply(this, arguments);
            };
          })()
        );
    });
  })();
})();
//# sourceMappingURL=contentScript.js.map
