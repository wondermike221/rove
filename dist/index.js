var q = Object.defineProperty;
var z = (r, t, n) => t in r ? q(r, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : r[t] = n;
var $ = (r, t, n) => z(r, typeof t != "symbol" ? t + "" : t, n);
import { delegateEvents as G, template as m, insert as f, createComponent as v, effect as R, setAttribute as A, use as K } from "solid-js/web";
import { createSignal as k, createEffect as O, on as P, createMemo as M, Show as C, For as W } from "solid-js";
import { Transition as H } from "solid-transition-group";
var b = /* @__PURE__ */ ((r) => (r.DIRECTORY = "DIRECTORY", r.LEAF = "LEAF", r))(b || {});
class Y {
  /**
   * Creates an instance of Node.
   * @param id A unique identifier for the node.
   * @param name The display name of the node.
   * @param type The type of the node (DIRECTORY or LEAF).
   * @param parent The parent node (null if root).
   * @param action The callback function if the node is a LEAF.
   */
  constructor(t, n, i, y = null, c) {
    $(this, "id");
    $(this, "name");
    $(this, "type");
    $(this, "parent");
    // Properties specific to type
    $(this, "children");
    $(this, "action");
    this.id = t, this.name = n, this.type = i, this.parent = y, i === "DIRECTORY" ? this.children = [] : i === "LEAF" && (typeof c != "function" ? (console.warn(
      `Action for LEAF node "${n}" (ID: ${t}) is not a function.`
    ), this.action = () => console.warn(`No action defined for "${n}" (ID: ${t})`)) : this.action = c);
  }
}
class ae {
  // For quick node lookup by ID
  /**
   * Creates an instance of DirectoryTree.
   * @param rootName The name for the root directory.
   */
  constructor(t = "Root") {
    $(this, "root");
    $(this, "nodeMap");
    const n = "root-" + this.generateId();
    this.root = new Y(n, t, "DIRECTORY", null), this.nodeMap = /* @__PURE__ */ new Map(), this.nodeMap.set(n, this.root);
  }
  /**
   * Generates a simple unique ID.
   * @returns A random string ID.
   */
  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }
  /**
   * Adds a new node (directory or leaf) to a specified parent node.
   * @param parentNode The parent Node object.
   * @param name The display name of the new node.
   * @param type The type of the new node (DIRECTORY or LEAF).
   * @param action Optional callback function if the node is a LEAF.
   * @returns The created Node, or null if creation failed.
   */
  addNodeToParent(t, n, i, y) {
    if (!t)
      return console.error(
        `Cannot add node "${n}": Parent node is null or undefined.`
      ), null;
    if (t.type !== "DIRECTORY")
      return console.error(
        `Parent node "${t.name}" (ID: ${t.id}) is not a directory.`
      ), null;
    if (t.children || (t.children = [], console.warn(
      `Children array was missing for directory node "${t.name}". Initialized.`
    )), t.children.length >= 9)
      return console.warn(
        `Directory "${t.name}" (ID: ${t.id}) already has 9 items. Cannot add "${n}".`
      ), null;
    const c = i.toLowerCase() + "-" + this.generateId(), g = new Y(c, n, i, t, y);
    return t.children.push(g), this.nodeMap.set(c, g), g;
  }
  /**
   * Convenience method to add a node using the parent's ID.
   * @param parentId The ID of the parent node.
   * @param name The display name of the new node.
   * @param type The type of the new node.
   * @param action Optional callback for LEAF nodes.
   * @returns The created Node, or null if parent not found or creation failed.
   */
  addNode(t, n, i, y) {
    const c = this.findNode(t);
    return c ? this.addNodeToParent(c, n, i, y) : (console.error(`Parent node with id "${t}" not found.`), null);
  }
  /**
   * Finds a node in the tree by its ID.
   * @param id The ID of the node to find.
   * @returns The Node if found, otherwise null.
   */
  findNode(t) {
    return this.nodeMap.get(t) || null;
  }
  /**
   * Retrieves the path from the root to the specified node as an array of node names.
   * Useful for breadcrumbs or displaying the current location.
   * @param nodeId The ID of the target node.
   * @returns An array of strings (node names) representing the path, or an empty array if node not found.
   */
  getNodePathNames(t) {
    const n = [];
    let i = this.findNode(t);
    for (; i; )
      n.unshift(i.name), i = i.parent;
    return n;
  }
}
var J = /* @__PURE__ */ m('<button class=close-button aria-label="Close panel">&times; '), Q = /* @__PURE__ */ m("<div class=current-record-info>"), U = /* @__PURE__ */ m("<ul>"), V = /* @__PURE__ */ m("<div class=options-view>"), X = /* @__PURE__ */ m('<div class=directory-nav-container tabindex=0><div class=directory-header><div class=header-left-controls><button class=back-button aria-label="Go back">&larr;</button><div class=current-path></div></div></div><div class=options-list-wrapper>'), Z = /* @__PURE__ */ m("<p class=empty-directory-message>"), ee = /* @__PURE__ */ m("<span class=option-type-indicator>&rarr;"), te = /* @__PURE__ */ m("<li class=options-list-item role=button tabindex=0><span class=option-number>.</span><span class=option-name>");
function le(r) {
  const t = () => r.initialNodeId ? r.tree.findNode(r.initialNodeId) : r.tree.root, [n, i] = k(t() || r.tree.root), [y, c] = k(!1), [g, w] = k("initial-load");
  let _;
  O(P(() => r.initialNodeId, (e) => {
    var o, d;
    if (e) {
      const l = r.tree.findNode(e);
      l && l.id !== ((o = n()) == null ? void 0 : o.id) && (w("initial-load"), i(l));
    } else ((d = n()) == null ? void 0 : d.id) !== r.tree.root.id && (w("initial-load"), i(r.tree.root));
  }));
  const F = M(() => n() ? n().name : "Loading..."), E = M(() => {
    const e = n();
    return e && e.type === b.DIRECTORY && e.children ? e.children.map((o, d) => ({
      ...o,
      displayIndex: d + 1
    })) : [];
  }), D = (e) => {
    if (e) {
      if (e.type === b.DIRECTORY)
        w("slide-forward"), i(e);
      else if (e.type === b.LEAF && e.action)
        try {
          e.action(), r.onLeafAction && r.onLeafAction(`Executed: ${e.name}`, e);
        } catch (o) {
          console.error(`Error executing action for "${e.name}":`, o), r.onLeafAction && r.onLeafAction(`Error executing: ${e.name}`, e);
        }
    }
  }, N = () => {
    var o;
    const e = (o = n()) == null ? void 0 : o.parent;
    e && (w("slide-backward"), i(e));
  }, S = (e) => {
    var o;
    if (y())
      if (e.key === "Backspace")
        (o = n()) != null && o.parent && (e.preventDefault(), e.stopPropagation(), N());
      else {
        let d = -1;
        if (e.key >= "1" && e.key <= "9")
          d = parseInt(e.key);
        else if (e.code.startsWith("Numpad") && e.code.length === 7) {
          const l = parseInt(e.code.substring(6));
          l >= 1 && l <= 9 && (d = l);
        }
        if (d !== -1) {
          e.preventDefault(), e.stopPropagation();
          const l = d - 1, I = E();
          l >= 0 && l < I.length && D(I[l]);
        }
      }
  };
  return O(P(n, () => {
    g() === "initial-load" && queueMicrotask(() => {
    });
  }, {
    defer: !0
  })), (() => {
    var e = X(), o = e.firstChild, d = o.firstChild, l = d.firstChild, I = l.nextSibling, T = o.nextSibling;
    e.$$keydown = S, e.addEventListener("blur", () => c(!1)), e.addEventListener("focus", () => c(!0));
    var L = _;
    return typeof L == "function" ? K(L, e) : _ = e, l.$$click = N, f(I, F), f(o, v(C, {
      get when() {
        return r.onClose;
      },
      get children() {
        var a = J();
        return a.$$click = () => r.onClose && r.onClose(), a;
      }
    }), null), f(e, v(C, {
      get when() {
        return r.currentRecordDisplay;
      },
      get children() {
        var a = Q();
        return f(a, () => r.currentRecordDisplay), a;
      }
    }), T), f(T, v(H, {
      get name() {
        return g();
      },
      mode: "outin",
      get children() {
        var a = V();
        return f(a, v(C, {
          get when() {
            return E().length > 0;
          },
          get fallback() {
            return (() => {
              var u = Z();
              return f(u, () => {
                var s;
                return ((s = n()) == null ? void 0 : s.type) === b.DIRECTORY ? "This directory is empty." : "No options.";
              }), u;
            })();
          },
          get children() {
            var u = U();
            return f(u, v(W, {
              get each() {
                return E();
              },
              children: (s) => (() => {
                var h = te(), p = h.firstChild, B = p.firstChild, j = p.nextSibling;
                return h.addEventListener("keypress", (x) => {
                  (x.key === "Enter" || x.key === " ") && D(s);
                }), h.$$click = () => D(s), f(p, () => s.displayIndex, B), f(j, () => s.name), f(h, v(C, {
                  get when() {
                    return s.type === b.DIRECTORY;
                  },
                  get children() {
                    return ee();
                  }
                }), null), R(() => A(h, "aria-label", `Option ${s.displayIndex}: ${s.name}`)), h;
              })()
            })), u;
          }
        })), R((u) => (u = n() ? "block" : "none") != null ? a.style.setProperty("display", u) : a.style.removeProperty("display")), a;
      }
    })), R((a) => {
      var h, p;
      var u = ((h = n()) == null ? void 0 : h.parent) === null, s = r.tree.getNodePathNames(((p = n()) == null ? void 0 : p.id) || r.tree.root.id).join(" / ");
      return u !== a.e && (l.disabled = a.e = u), s !== a.t && A(I, "title", a.t = s), a;
    }, {
      e: void 0,
      t: void 0
    }), e;
  })();
}
G(["keydown", "click"]);
export {
  le as DirectoryNav,
  ae as DirectoryTree,
  Y as Node,
  b as NodeType
};
