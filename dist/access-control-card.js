/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$3=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$3=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$4=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$3,defineProperty:e$2,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$2,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$2=c$1?c$1.emptyScript:"",p$2=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$2:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$3(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$2(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$2?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$2=t=>t,s$1=t$1.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r$1=`<${n}>`,l$1=document,c=()=>l$1.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m$1=/>/g,p$1=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),w=x(2),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l$1.createTreeWalker(l$1,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m$1:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p$1):void 0!==u[3]&&(c=p$1):c===p$1?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p$1:'"'===u[3]?$:g):c===$||c===g?c=p$1:c===_||c===m$1?c=v:(c=p$1,n=void 0);const x=c===p$1&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$1:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l$1.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l$1).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l$1,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l$1.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$2(t).nextSibling;i$2(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$1 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$1._$litElement$=true,i$1["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$1});const o=s.litElementPolyfillSupport;o?.({LitElement:i$1});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},e=t=>(...e)=>({_$litDirective$:t,values:e});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r=o=>void 0===o.strings,m={},p=(o,t=m)=>o._$AH=t;

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const l=e(class extends i{constructor(r$1){if(super(r$1),r$1.type!==t.PROPERTY&&r$1.type!==t.ATTRIBUTE&&r$1.type!==t.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!r(r$1))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(i,[t$1]){if(t$1===E||t$1===A)return t$1;const o=i.element,l=i.name;if(i.type===t.PROPERTY){if(t$1===o[l])return E}else if(i.type===t.BOOLEAN_ATTRIBUTE){if(!!t$1===o.hasAttribute(l))return E}else if(i.type===t.ATTRIBUTE&&o.getAttribute(l)===t$1+"")return E;return p(i),t$1}});

const colorSchemes = [
    "home-assistant",
    "bright",
    "warm",
    "mint",
    "sky",
    "lavender",
];
const en$1 = {
    label: "Color scheme",
    "home-assistant": "Home Assistant",
    bright: "Bright",
    warm: "Warm",
    mint: "Mint",
    sky: "Sky",
    lavender: "Lavender",
    invalid: "Choose a valid color_scheme: home-assistant, bright, warm, mint, sky or lavender.",
};
const nb$1 = {
    label: "Fargevalg",
    "home-assistant": "Home Assistant",
    bright: "Lys",
    warm: "Varm",
    mint: "Mint",
    sky: "Himmelblå",
    lavender: "Lavendel",
    invalid: "Velg en gyldig color_scheme: home-assistant, bright, warm, mint, sky eller lavender.",
};
function colorSchemeText(hass) {
    const language = (hass?.language || hass?.locale?.language || "en")
        .toLowerCase()
        .replace(/_/g, "-")
        .split("-")[0];
    return ["nb", "no", "nn"].includes(language) ? nb$1 : en$1;
}
function applyColorScheme(host, value, hass) {
    const scheme = value === undefined ? "home-assistant" : value;
    if (typeof scheme !== "string" ||
        !colorSchemes.includes(scheme)) {
        throw new Error(colorSchemeText(hass).invalid);
    }
    if (scheme === "home-assistant")
        host.removeAttribute("data-color-scheme");
    else
        host.setAttribute("data-color-scheme", scheme);
}
function colorSchemeSelector(hass, value, change) {
    const text = colorSchemeText(hass);
    return b `<label
    style="display:flex;flex-direction:column;align-items:stretch;gap:6px;margin:12px 0;"
  >
    ${text.label}
    <select
      name="color_scheme"
      style="font:inherit;min-height:44px;width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--divider-color, #ccc);background:var(--card-background-color, #fff);color:var(--primary-text-color, #202b36);"
      .value=${l(String(value ?? "home-assistant"))}
      @change=${(event) => {
        event.stopPropagation();
        change(event.target.value);
    }}
    >
      ${colorSchemes.map((scheme) => b `<option value=${scheme} ?selected=${scheme === (value ?? "home-assistant")}>${text[scheme]}</option>`)}
    </select>
  </label>`;
}
/** Local overrides only: removing the attribute restores the dashboard theme. */
const colorSchemeStyles = i$4 `
  :host([data-color-scheme]) {
    color-scheme: light;
    --primary-text-color: #202b36;
    --secondary-text-color: #52606d;
    --disabled-text-color: #626d78;
    --text-primary-color: #fff;
    --success-color: #28723c;
    --warning-color: #8c6100;
    --error-color: #bd2635;
    --orange-color: #ab4b13;
    --info-color: #146a91;
    --primary-color: var(--scheme-accent);
    --accent-color: var(--scheme-accent);
    --card-background-color: var(--scheme-surface);
    --ha-card-background: var(--scheme-surface);
    --primary-background-color: var(--scheme-surface);
    --secondary-background-color: var(--scheme-secondary);
    --divider-color: var(--scheme-border);
    --ha-card-border-color: var(--scheme-border);
    --bubble-main-background-color: var(--scheme-surface);
    --bubble-secondary-background-color: var(--scheme-secondary);
    --bubble-icon-background-color: var(--scheme-secondary);
    --bubble-sub-button-background-color: var(--scheme-secondary);
    --bubble-accent-color: var(--scheme-accent);
    --bubble-border: 1px solid var(--scheme-border);
    --ha-card-box-shadow: 0 2px 8px rgb(32 43 54 / 0.06);
    --bubble-box-shadow: var(--ha-card-box-shadow);
    --input-fill-color: var(--scheme-secondary);
    --input-ink-color: var(--primary-text-color);
    --input-label-ink-color: var(--secondary-text-color);
    --mdc-theme-primary: var(--scheme-accent);
    --mdc-theme-surface: var(--scheme-surface);
    --mdc-theme-on-surface: var(--primary-text-color);
    --mdc-text-field-fill-color: var(--scheme-secondary);
    --mdc-text-field-ink-color: var(--primary-text-color);
  }
  :host([data-color-scheme="bright"]) {
    --scheme-surface: #ffffff;
    --scheme-secondary: #edf3fa;
    --scheme-accent: #2365a5;
    --scheme-border: #ccd9e7;
  }
  :host([data-color-scheme="warm"]) {
    --scheme-surface: #fffaf1;
    --scheme-secondary: #f4ead9;
    --scheme-accent: #885321;
    --scheme-border: #ddd0ba;
  }
  :host([data-color-scheme="mint"]) {
    --scheme-surface: #f2fbf5;
    --scheme-secondary: #dfefe5;
    --scheme-accent: #286c50;
    --scheme-border: #c1d9ca;
  }
  :host([data-color-scheme="sky"]) {
    --scheme-surface: #f1f8ff;
    --scheme-secondary: #dfeefa;
    --scheme-accent: #22638e;
    --scheme-border: #c2d8e9;
  }
  :host([data-color-scheme="lavender"]) {
    --scheme-surface: #faf5ff;
    --scheme-secondary: #ede3f6;
    --scheme-accent: #725095;
    --scheme-border: #d7c8e5;
  }
`;

function items(value, domain, key) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        throw new Error(`${key} must be a list`);
    return value.map((item) => {
        const entity = typeof item === "string" ? item : item?.entity;
        if (typeof entity !== "string" || !entity.startsWith(`${domain}.`))
            throw new Error(`${key} entries must be ${domain} entities`);
        if (typeof item === "string")
            return item;
        if (item.contact !== undefined &&
            !String(item.contact).startsWith("binary_sensor."))
            throw new Error(`${key} contact must be a binary_sensor`);
        if (item.name !== undefined && typeof item.name !== "string")
            throw new Error(`${key} name must be text`);
        return { entity, contact: item.contact, name: item.name };
    });
}
function validateConfig(input) {
    if (!input || typeof input !== "object")
        throw new Error("Card configuration is required");
    const config = {
        appearance: "default",
        confirm_unlock: false,
        confirm_gate: false,
        ...input,
    };
    if (!["default", "bubble"].includes(String(config.appearance)))
        throw new Error("appearance must be default or bubble");
    for (const key of ["confirm_unlock", "confirm_gate"])
        if (typeof config[key] !== "boolean")
            throw new Error(`${key} must be boolean`);
    if (config.title !== undefined && typeof config.title !== "string")
        throw new Error("title must be text");
    if (config.access_event !== undefined &&
        (typeof config.access_event !== "string" ||
            !config.access_event.startsWith("event.")))
        throw new Error("access_event must be an event entity");
    return {
        ...config,
        doors: items(config.doors, "lock", "doors"),
        gates: items(config.gates, "cover", "gates"),
    };
}

const paths = {
    locked: w `<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"></rect><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"></path>`,
    unlocked: w `<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"></rect><path d="M8 10.5V7a4 4 0 0 1 7.7-1.5"></path>`,
    door: w `<path d="M5 21V4a1 1 0 0 1 1-1h9l4 2v16"></path><path d="M3 21h18"></path><circle cx="12.5" cy="12" r=".9"></circle>`,
    gate: w `<path d="M3 21V6M21 21V6"></path><path d="M3 9h18M3 15h18"></path><path d="M8 9v6M12 9v6M16 9v6"></path>`,
    shield: w `<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path>`,
    warning: w `<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path>`,
    unknown: w `<circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01"></path>`,
    person: w `<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>`,
    up: w `<path d="m6 15 6-6 6 6"></path>`,
    down: w `<path d="m6 9 6 6 6-6"></path>`,
    stop: w `<rect x="7" y="7" width="10" height="10" rx="1.5"></rect>`,
    spinner: w `<path d="M21 12a9 9 0 1 1-6.2-8.56"></path>`,
};
// No whitespace inside <svg>: it would leak into a button's textContent.
// prettier-ignore
const icon = (name, extra = "") => b `<svg class="i ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;

const norwegian = (value) => /^(nb|nn|no)(-|$)/.test(value);
const normalize = (value) => (value ?? "").replace(/_/g, "-").toLowerCase();
/** Dictionary: Bokmål for nb, no and nn (no Nynorsk dictionary), else English. */
function dictionary(hass) {
    return norwegian(normalize(hass?.language || hass?.locale?.language))
        ? "nb"
        : "en";
}
/** Formatting locale, separate from the dictionary: en-GB keeps its 24-hour clock. */
function formatLocale(hass) {
    const value = normalize(hass?.locale?.language || hass?.language || "en");
    if (norwegian(value))
        return "nb-NO";
    try {
        return Intl.getCanonicalLocales(value)[0] ?? "en";
    }
    catch {
        return "en";
    }
}
const en = {
    title: "Doors and gates",
    doors: "Doors",
    gates: "Gates",
    allLocked: "All locked",
    unlockedCount: "{n} unlocked",
    unlockedOne: "1 unlocked",
    openCount: "{n} open",
    openOne: "1 open",
    problemCount: "{n} need attention",
    problemOne: "1 needs attention",
    unknownCount: "{n} not responding",
    unknownOne: "1 not responding",
    nothing: "Add doors and gates in the card editor.",
    locked: "Locked",
    unlocked: "Unlocked",
    locking: "Locking…",
    unlocking: "Unlocking…",
    jammed: "Jammed",
    lockOpen: "Open",
    lockOpening: "Opening…",
    gateOpen: "Open",
    gateClosed: "Closed",
    gateOpening: "Opening…",
    gateClosing: "Closing…",
    unavailable: "Not responding",
    doorOpen: "door open",
    doorClosed: "door closed",
    lock: "Lock",
    unlock: "Unlock",
    open: "Open",
    close: "Close",
    stop: "Stop",
    withCode: "Enter code",
    lockAll: "Lock all",
    closeAll: "Close all",
    secureAll: "Lock and close all",
    confirmUnlock: "Unlock {name}?",
    confirmUnlockBody: "Anyone at the door can come in until it is locked again.",
    confirmOpen: "Open {name}?",
    confirmOpenBody: "The gate stays open until it is closed.",
    cancel: "Cancel",
    sending: "Sending…",
    failed: "{name}: could not {action}",
    lastEvent: "Last at the panel",
    ev_unlock: "{who} unlocked",
    ev_lock: "{who} locked",
    ev_open: "{who} opened the gate",
    ev_close: "{who} closed the gate",
    someone: "Someone",
    level_guest: "guest",
    level_resident: "resident",
    level_admin: "admin",
    // Editor
    cardTitle: "Title",
    appearance: "Appearance",
    default: "Default",
    bubble: "Bubble",
    doorsLabel: "Door locks",
    gatesLabel: "Gates",
    accessEvent: "Access event (panel)",
    confirmUnlockLabel: "Confirm before unlocking",
    confirmGateLabel: "Confirm before opening a gate",
};
const nb = {
    title: "Dører og porter",
    doors: "Dører",
    gates: "Porter",
    allLocked: "Alt er låst",
    unlockedCount: "{n} ulåst",
    unlockedOne: "1 ulåst",
    openCount: "{n} åpne",
    openOne: "1 åpen",
    problemCount: "{n} trenger tilsyn",
    problemOne: "1 trenger tilsyn",
    unknownCount: "{n} svarer ikke",
    unknownOne: "1 svarer ikke",
    nothing: "Legg til dører og porter i kortredigeringen.",
    locked: "Låst",
    unlocked: "Ulåst",
    locking: "Låser …",
    unlocking: "Låser opp …",
    jammed: "Fastlåst",
    lockOpen: "Åpen",
    lockOpening: "Åpner …",
    gateOpen: "Åpen",
    gateClosed: "Lukket",
    gateOpening: "Åpner …",
    gateClosing: "Lukker …",
    unavailable: "Svarer ikke",
    doorOpen: "døra står åpen",
    doorClosed: "døra er lukket",
    lock: "Lås",
    unlock: "Lås opp",
    open: "Åpne",
    close: "Lukk",
    stop: "Stopp",
    withCode: "Skriv kode",
    lockAll: "Lås alle",
    closeAll: "Lukk alle",
    secureAll: "Lås og lukk alle",
    confirmUnlock: "Låse opp {name}?",
    confirmUnlockBody: "Alle ved døra kan gå inn til den er låst igjen.",
    confirmOpen: "Åpne {name}?",
    confirmOpenBody: "Porten står åpen til den lukkes.",
    cancel: "Avbryt",
    sending: "Sender …",
    failed: "{name}: kunne ikke {action}",
    lastEvent: "Sist ved panelet",
    ev_unlock: "{who} låste opp",
    ev_lock: "{who} låste",
    ev_open: "{who} åpnet porten",
    ev_close: "{who} lukket porten",
    someone: "Noen",
    level_guest: "gjest",
    level_resident: "beboer",
    level_admin: "admin",
    cardTitle: "Tittel",
    appearance: "Utseende",
    default: "Standard",
    bubble: "Bubble",
    doorsLabel: "Dørlåser",
    gatesLabel: "Porter",
    accessEvent: "Tilgangshendelse (panel)",
    confirmUnlockLabel: "Bekreft før opplåsing",
    confirmGateLabel: "Bekreft før en port åpnes",
};
function localize(hass, key, values = {}) {
    return { en, nb }[dictionary(hass)][key].replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}

const CONTACT_CLASSES = new Set(["door", "garage_door", "opening", "window"]);
const COVER_STOP = 8; // CoverEntityFeature.STOP
const itemEntity = (item) => typeof item === "string" ? item : item.entity;
/**
 * A door contact on the same device as the lock or gate, if Home Assistant's
 * registry shows exactly one; an explicit `contact` in the config wins.
 */
function pairedContact(hass, entity) {
    const device = hass.entities?.[entity]?.device_id;
    if (!device)
        return undefined;
    const matches = Object.values(hass.entities ?? {}).filter((entry) => entry.device_id === device &&
        entry.entity_id.startsWith("binary_sensor.") &&
        CONTACT_CLASSES.has(String(hass.states[entry.entity_id]?.attributes.device_class ?? "")));
    return matches.length === 1 ? matches[0].entity_id : undefined;
}
function areaName(hass, entity) {
    const entry = hass.entities?.[entity];
    const areaId = entry?.area_id ??
        (entry?.device_id ? hass.devices?.[entry.device_id]?.area_id : undefined);
    return areaId ? hass.areas?.[areaId]?.name : undefined;
}
function friendly(hass, entity) {
    const name = hass.states[entity]?.attributes.friendly_name;
    return typeof name === "string" && name.trim() ? name : entity;
}
const MISSING = new Set(["unavailable", "unknown", ""]);
function resolve(hass, item, kind) {
    const entity = itemEntity(item);
    const explicit = typeof item === "string" ? undefined : item;
    const contact = explicit?.contact ?? pairedContact(hass, entity);
    const state = hass.states[entity];
    const value = state?.state ?? "";
    const contactState = contact ? hass.states[contact]?.state : undefined;
    const opened = contactState === "on" ? true : contactState === "off" ? false : undefined;
    const available = !MISSING.has(value);
    let tone;
    if (!available)
        tone = "unknown";
    else if (value === "jammed")
        tone = "problem";
    else if (opened ||
        (kind === "gate" && value !== "closed") ||
        value === "open" ||
        value === "opening")
        tone = "open";
    else if (kind === "door" && value !== "locked")
        tone = "attention";
    else
        tone = "ok";
    return {
        kind,
        entity,
        contact,
        name: explicit?.name ?? friendly(hass, entity),
        area: areaName(hass, entity),
        state: value,
        opened,
        available,
        tone,
        needsCode: kind === "door" &&
            typeof state?.attributes.code_format === "string" &&
            state.attributes.code_format !== "",
        canStop: kind === "gate" &&
            ((Number(state?.attributes.supported_features) || 0) & COVER_STOP) !== 0,
    };
}
const RANK = {
    problem: 0,
    unknown: 1,
    open: 2,
    attention: 3,
    ok: 4,
};
/** The card's overall tone: the most urgent of its doors and gates. */
function overall(items) {
    return items.reduce((worst, item) => (RANK[item.tone] < RANK[worst] ? item.tone : worst), "ok");
}
/** Lock and gate entities the editor offers. */
function candidates(hass, domain) {
    return Object.keys(hass.states)
        .filter((id) => id.startsWith(`${domain}.`) &&
        (domain === "lock" ||
            ["gate", "garage"].includes(String(hass.states[id].attributes.device_class ?? ""))))
        .sort();
}

const styles = i$4 `
  :host {
    display: block;
    color: var(--primary-text-color, #1b1b1a);
    font-family: var(--paper-font-body1_-_font-family, system-ui);
    --ac-text: var(--primary-text-color, #1b1b1a);
    --ac-muted: var(--secondary-text-color, #5b5a55);
    --ac-ok: var(--success-color, #2e7d32);
    --ac-attention: var(--warning-color, #f59e0b);
    --ac-open: var(--orange-color, #ea580c);
    --ac-problem: var(--error-color, #c62828);
    --ac-unknown: var(--disabled-text-color, #8a8984);
  }
  * {
    box-sizing: border-box;
  }
  ha-card,
  dialog {
    --ac-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --ac-pill: var(--secondary-background-color, #f3f2ee);
    --ac-radius: 20px;
    --ac-tile: 16px;
  }
  ha-card.bubble {
    --ac-surface: var(
      --bubble-main-background-color,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    --ac-pill: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f3f2ee)
    );
    --ac-radius: var(--bubble-border-radius, 32px);
    --ac-tile: var(--bubble-sub-button-border-radius, 22px);
    border: var(--bubble-border, none);
    border-radius: var(--bubble-border-radius, 32px);
    box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow));
  }
  ha-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--ac-surface);
    border-radius: var(--ha-card-border-radius, 16px);
  }
  .sev-ok {
    --sev: var(--ac-ok);
  }
  .sev-attention {
    --sev: var(--ac-attention);
  }
  .sev-open {
    --sev: var(--ac-open);
  }
  .sev-problem {
    --sev: var(--ac-problem);
  }
  .sev-unknown {
    --sev: var(--ac-unknown);
  }
  .i {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
  .i.s {
    width: 18px;
    height: 18px;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spin {
      animation: none;
    }
  }
  .circ {
    flex: 0 0 44px;
    width: 44px;
    height: 44px;
    border-radius: var(--bubble-icon-border-radius, 50%);
    display: grid;
    place-items: center;
    color: color-mix(in srgb, var(--sev) 75%, var(--ac-text));
    background: color-mix(in srgb, var(--sev) 20%, transparent);
  }
  .circ.big {
    flex-basis: 52px;
    width: 52px;
    height: 52px;
  }
  .title {
    font-size: 17px;
    font-weight: 700;
    color: var(--ac-muted);
    padding: 0 8px;
  }
  .hero {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px;
    border-radius: var(--ac-radius);
    background: var(--ac-pill);
  }
  .hero-text {
    flex: 1;
    min-width: 0;
  }
  .headline {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }
  .event {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--ac-muted);
    overflow-wrap: anywhere;
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  h3 {
    margin: 4px 8px 2px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ac-muted);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 6px;
    border-radius: var(--ac-radius);
    background: var(--ac-pill);
  }
  .row.sev-open,
  .row.sev-problem {
    background: color-mix(in srgb, var(--sev) 14%, var(--ac-pill));
  }
  .who {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1 1 180px;
    min-width: 0;
    min-height: 48px;
    padding: 0 6px 0 0;
    border: 0;
    border-radius: calc(var(--ac-radius) - 4px);
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .who-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-weight: 700;
    overflow-wrap: anywhere;
  }
  .state {
    font-size: 13px;
    color: var(--ac-muted);
    overflow-wrap: anywhere;
  }
  .state strong {
    color: color-mix(in srgb, var(--sev) 60%, var(--ac-text));
  }
  .actions {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }
  button.act {
    min-height: 44px;
    min-width: 44px;
    padding: 0 16px;
    border: 0;
    border-radius: 22px;
    font: inherit;
    font-weight: 700;
    color: var(--ac-text);
    background: color-mix(in srgb, var(--ac-text) 8%, transparent);
    cursor: pointer;
  }
  button.act.arrow {
    width: 44px;
    padding: 0;
    display: grid;
    place-items: center;
  }
  button.act.primary {
    color: #fff;
    background: color-mix(in srgb, var(--ac-ok) 62%, #000);
  }
  button.act.risky {
    color: #fff;
    background: color-mix(in srgb, var(--ac-open) 62%, #000);
  }
  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  button:focus-visible {
    outline: 2px solid var(--primary-color, #0277bd);
    outline-offset: 2px;
  }
  .confirm {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: var(--ac-radius);
    background: color-mix(in srgb, var(--ac-open) 16%, var(--ac-pill));
    --sev: var(--ac-open);
  }
  .confirm p {
    margin: 0;
  }
  .confirm-title {
    font-size: 20px;
    font-weight: 800;
  }
  .confirm-actions {
    display: flex;
    gap: 8px;
  }
  .confirm-actions button {
    flex: 1;
  }
  .lock-all {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 52px;
    border: 0;
    border-radius: var(--ac-radius);
    font: inherit;
    font-weight: 700;
    color: #fff;
    background: color-mix(in srgb, var(--ac-ok) 62%, #000);
    cursor: pointer;
  }
  .note {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px 14px;
    border-radius: var(--ac-tile);
    font-size: 14px;
    background: color-mix(in srgb, var(--sev) 16%, var(--ac-pill));
  }
  @media (max-width: 400px) {
    ha-card {
      padding: 12px;
    }
    .headline {
      font-size: 24px;
    }
  }
  ${colorSchemeStyles}
`;

/** Card-only choices: which doors and gates, the access event, title, look and confirmations. */
class AccessControlCardEditor extends i$1 {
    constructor() {
        super(...arguments);
        this.config = {};
    }
    set hass(value) {
        this.ha = value;
        this.requestUpdate();
    }
    setConfig(config) {
        this.config = { ...config };
        this.requestUpdate();
    }
    t(key) {
        return localize(this.ha, key);
    }
    emit(config) {
        this.config = config;
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true,
        }));
        this.requestUpdate();
    }
    set(key, value) {
        const config = { ...this.config };
        if (value === "" || value === undefined)
            delete config[key];
        else
            config[key] = value;
        this.emit(config);
    }
    /** Toggle one entity, keeping any YAML object entry (name, contact) intact. */
    toggle(key, entity, on) {
        const items = (this.config[key] ?? []).filter((item) => itemEntity(item) !== entity);
        const existing = (this.config[key] ?? []).find((item) => itemEntity(item) === entity);
        this.set(key, on ? [...items, existing ?? entity] : items);
    }
    list(key, domain, label) {
        const states = this.ha?.states ?? {};
        const chosen = (this.config[key] ?? []).map(itemEntity);
        const options = [
            ...new Set([...chosen, ...candidates(this.ha ?? { states }, domain)]),
        ];
        const name = (id) => {
            const value = states[id]?.attributes.friendly_name;
            return typeof value === "string" && value ? value : id;
        };
        return b `<fieldset data-list=${key}>
      <legend>${this.t(label)}</legend>
      ${options.length
            ? options.map((id) => b `<label>
                  <input
                    type="checkbox"
                    value=${id}
                    .checked=${chosen.includes(id)}
                    @change=${(event) => this.toggle(key, id, event.target.checked)}
                  />
                  <span>${name(id)} <small>${id}</small></span>
                </label>`)
            : b `<small>—</small>`}
    </fieldset>`;
    }
    render() {
        const states = this.ha?.states ?? {};
        const events = Object.keys(states)
            .filter((id) => id.startsWith("event."))
            .sort();
        const event = String(this.config.access_event ?? "");
        const check = (key, label) => b `<label>
        <input
          type="checkbox"
          data-field=${key}
          .checked=${this.config[key] === true}
          @change=${(e) => this.set(key, e.target.checked)}
        />
        ${this.t(label)}
      </label>`;
        return b `
      ${colorSchemeSelector(this.ha, this.config.color_scheme, (scheme) => this.set("color_scheme", scheme))}
      <label class="field">
        ${this.t("cardTitle")}
        <input
          type="text"
          data-field="title"
          .value=${String(this.config.title ?? "")}
          placeholder=${this.t("title")}
          @change=${(e) => this.set("title", e.target.value)}
        />
      </label>
      ${this.list("doors", "lock", "doorsLabel")}
      ${this.list("gates", "cover", "gatesLabel")}
      <label class="field">
        ${this.t("accessEvent")}
        <select
          data-field="access_event"
          @change=${(e) => this.set("access_event", e.target.value)}
        >
          <option value="" ?selected=${!event}>—</option>
          ${[...new Set([...(event ? [event] : []), ...events])].map((id) => b `<option value=${id} ?selected=${id === event}>
                ${id}
              </option>`)}
        </select>
      </label>
      ${check("confirm_unlock", "confirmUnlockLabel")}
      ${check("confirm_gate", "confirmGateLabel")}
      <label class="field">
        ${this.t("appearance")}
        <select
          data-field="appearance"
          @change=${(e) => this.set("appearance", e.target.value)}
        >
          ${["default", "bubble"].map((value) => b `<option
                value=${value}
                ?selected=${(this.config.appearance ?? "default") === value}
              >
                ${this.t(value)}
              </option>`)}
        </select>
      </label>
      ${A}
    `;
    }
}
AccessControlCardEditor.styles = i$4 `
    :host {
      display: block;
    }
    fieldset {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 12px;
      margin: 0 0 16px;
      padding: 8px 12px 12px;
    }
    legend {
      font-weight: 600;
      padding: 0 4px;
    }
    label {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 40px;
    }
    label.field {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    select,
    input[type="text"] {
      font: inherit;
      min-height: 44px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #1b1b1a);
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
    }
    small {
      color: var(--secondary-text-color, #5b5a55);
    }
  `;
customElements.define("access-control-card-editor", AccessControlCardEditor);

const SERVICE = {
    lock: ["lock", "lock"],
    unlock: ["lock", "unlock"],
    open: ["cover", "open_cover"],
    close: ["cover", "close_cover"],
    stop: ["cover", "stop_cover"],
};
const HERO_ICON = {
    ok: "shield",
    attention: "unlocked",
    open: "door",
    problem: "warning",
    unknown: "unknown",
};
/**
 * The house's doors and gates in one card. Home Assistant's lock and cover
 * entities are the authority; the card only calls their services.
 */
class AccessControlCard extends i$1 {
    constructor() {
        super(...arguments);
        /** Entity IDs with a request in flight; "*" is Lock all. */
        this.pending = new Set();
        this.failures = new Map();
    }
    static getConfigElement() {
        return document.createElement("access-control-card-editor");
    }
    static getStubConfig(hass) {
        return {
            doors: hass ? candidates(hass, "lock") : [],
            gates: hass ? candidates(hass, "cover") : [],
        };
    }
    setConfig(config) {
        const next = validateConfig(config);
        applyColorScheme(this, config.color_scheme, this.ha);
        this.config = next;
        this.confirming = undefined;
        this.failures.clear();
        this.requestUpdate();
    }
    set hass(value) {
        this.ha = value;
        this.requestUpdate();
    }
    get hass() {
        return this.ha;
    }
    getCardSize() {
        return (2 + (this.config?.doors.length ?? 0) + (this.config?.gates.length ?? 0));
    }
    t(key, values) {
        return localize(this.ha, key, values);
    }
    moreInfo(entityId) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
            detail: { entityId },
            bubbles: true,
            composed: true,
        }));
    }
    ask(item, action) {
        if (this.pending.has(item.entity) || this.pending.has("*"))
            return;
        const confirm = (action === "unlock" && this.config.confirm_unlock) ||
            (action === "open" && this.config.confirm_gate);
        if (confirm) {
            this.confirming = {
                entity: item.entity,
                action: action,
            };
            this.requestUpdate();
            return;
        }
        void this.call(item.entity, action, item.name);
    }
    call(entity, action, name) {
        return this.run(entity, name, [[action, [entity]]]);
    }
    /** Sends each step's service call; `key` marks what is pending ("*" for Lock all). */
    async run(key, name, steps) {
        if (this.pending.has(key))
            return;
        this.confirming = undefined;
        this.pending.add(key);
        this.failures.delete(key);
        for (const [, entities] of steps)
            for (const entity of entities)
                this.failures.delete(entity);
        this.requestUpdate();
        // Home Assistant reports the outcome in the entities' states.
        const results = await Promise.allSettled(steps.map(async ([action, entities]) => {
            if (!this.ha?.callService)
                throw new Error("Home Assistant service API unavailable");
            const [domain, service] = SERVICE[action];
            return this.ha.callService(domain, service, {}, { entity_id: entities.length === 1 ? entities[0] : entities }, false);
        }));
        const index = results.findIndex((r) => r.status === "rejected");
        if (index >= 0) {
            const error = results[index].reason;
            const reason = error instanceof Error
                ? error.message
                : typeof error === "object" && error && "message" in error
                    ? String(error.message)
                    : String(error);
            const action = this.t(steps[index][0]).toLocaleLowerCase(formatLocale(this.ha));
            this.failures.set(key, `${this.t("failed", { name, action })}: ${reason}`);
        }
        this.pending.delete(key);
        this.requestUpdate();
    }
    stateLabel(item) {
        if (!item.available)
            return this.t("unavailable");
        const door = {
            locked: "locked",
            unlocked: "unlocked",
            locking: "locking",
            unlocking: "unlocking",
            jammed: "jammed",
            open: "lockOpen",
            opening: "lockOpening",
        };
        const gate = {
            open: "gateOpen",
            closed: "gateClosed",
            opening: "gateOpening",
            closing: "gateClosing",
        };
        const key = (item.kind === "door" ? door : gate)[item.state];
        return key ? this.t(key) : item.state;
    }
    headline(items) {
        const count = (tone) => items.filter((i) => i.tone === tone).length;
        const part = (n, one, many) => n === 0 ? [] : [n === 1 ? this.t(one) : this.t(many, { n })];
        const parts = [
            ...part(count("problem"), "problemOne", "problemCount"),
            ...part(count("unknown"), "unknownOne", "unknownCount"),
            ...part(count("open"), "openOne", "openCount"),
            ...part(count("attention"), "unlockedOne", "unlockedCount"),
        ];
        return parts.length ? parts.join(" · ") : this.t("allLocked");
    }
    lastEvent() {
        const id = this.config?.access_event;
        const state = id ? this.ha?.states[id] : undefined;
        if (!state)
            return A;
        const a = state.attributes;
        const type = String(a.event_type ?? "");
        const at = new Date(state.state);
        if (!["unlock", "lock", "open", "close"].includes(type) ||
            Number.isNaN(at.getTime()))
            return A;
        const level = {
            guest: "level_guest",
            resident: "level_resident",
            user: "level_resident",
            admin: "level_admin",
        }[String(a.access_level ?? "")];
        const name = typeof a.user_name === "string" && a.user_name
            ? a.user_name
            : this.t("someone");
        const who = level ? `${name} (${this.t(level)})` : name;
        const hour12 = this.ha?.locale?.time_format === "12"
            ? true
            : this.ha?.locale?.time_format === "24"
                ? false
                : undefined;
        const today = at.toDateString() === new Date().toDateString();
        const time = new Intl.DateTimeFormat(formatLocale(this.ha), {
            ...(today ? {} : { dateStyle: "medium" }),
            timeStyle: "short",
            hour12,
        }).format(at);
        const door = type === "unlock" || type === "lock" ? a.door : undefined;
        return b `<div class="event" data-event>
      ${icon("person", "s")}
      <span
        >${this.t(`ev_${type}`, { who })}${typeof door === "string" && door ? ` · ${door}` : ""}
        · ${time}</span
      >
    </div>`;
    }
    /** Up, stop, down like Home Assistant's cover controls; a direction already reached is disabled. */
    gateArrows(item, disabled) {
        const arrow = (action, name, off) => b `<button
        class="act arrow"
        data-action=${action}
        aria-label="${this.t(action)}: ${item.name}"
        title=${this.t(action)}
        ?disabled=${disabled || off}
        @click=${() => this.ask(item, action)}
      >
        ${icon(name)}
      </button>`;
        return b `${arrow("open", "up", ["open", "opening"].includes(item.state))}
    ${item.canStop ? arrow("stop", "stop", false) : A}
    ${arrow("close", "down", ["closed", "closing"].includes(item.state))}`;
    }
    renderRow(item) {
        const busy = this.pending.has(item.entity) || this.pending.has("*");
        const disabled = busy || !item.available;
        const contact = item.opened === undefined
            ? ""
            : this.t(item.opened ? "doorOpen" : "doorClosed");
        const button = (action, cls = "") => b `<button
        class="act ${cls}"
        data-action=${action}
        ?disabled=${disabled}
        @click=${() => this.ask(item, action)}
      >
        ${this.t(action)}
      </button>`;
        const actions = item.kind === "door"
            ? item.needsCode
                ? b `<button
              class="act"
              data-action="code"
              ?disabled=${!item.available}
              @click=${() => this.moreInfo(item.entity)}
            >
              ${this.t("withCode")}
            </button>`
                : ["locked", "locking"].includes(item.state)
                    ? button("unlock")
                    : button("lock", "primary")
            : this.gateArrows(item, disabled);
        const failure = this.failures.get(item.entity);
        return b `<div class="row sev-${item.tone}" data-entity=${item.entity}>
        <button class="who" @click=${() => this.moreInfo(item.entity)}>
          <span class="circ"
            >${busy
            ? icon("spinner", "spin")
            : icon(item.kind === "gate"
                ? "gate"
                : item.state === "locked"
                    ? "locked"
                    : item.tone === "problem"
                        ? "warning"
                        : "unlocked")}</span
          >
          <span class="who-text">
            <span class="name">${item.name}</span>
            <span class="state"
              ><strong
                >${busy ? this.t("sending") : this.stateLabel(item)}</strong
              >${contact ? ` · ${contact}` : ""}${item.area ? ` · ${item.area}` : ""}</span
            >
          </span>
        </button>
        <div class="actions">${actions}</div>
      </div>
      ${failure
            ? b `<p class="note sev-problem" role="alert">
              ${icon("warning", "s")}${failure}
            </p>`
            : A}
      ${this.confirming?.entity === item.entity ? this.renderConfirm(item) : A}`;
    }
    renderConfirm(item) {
        const unlock = this.confirming.action === "unlock";
        return b `<div
      class="confirm"
      role="alertdialog"
      aria-labelledby="confirm-title"
      data-confirm
    >
      <div id="confirm-title" class="confirm-title">
        ${this.t(unlock ? "confirmUnlock" : "confirmOpen", { name: item.name })}
      </div>
      <p>${this.t(unlock ? "confirmUnlockBody" : "confirmOpenBody")}</p>
      <div class="confirm-actions">
        <button
          class="act"
          data-cancel
          @click=${() => {
            this.confirming = undefined;
            this.requestUpdate();
        }}
        >
          ${this.t("cancel")}
        </button>
        <button
          class="act risky"
          data-confirm-action
          @click=${() => void this.call(item.entity, this.confirming.action, item.name)}
        >
          ${this.t(unlock ? "unlock" : "open")}
        </button>
      </div>
    </div>`;
    }
    render() {
        if (!this.config || !this.ha)
            return A;
        const doors = this.config.doors.map((d) => resolve(this.ha, d, "door"));
        const gates = this.config.gates.map((g) => resolve(this.ha, g, "gate"));
        const all = [...doors, ...gates];
        const tone = all.length ? overall(all) : "unknown";
        const lockable = doors.filter((d) => d.available && !d.needsCode && d.state === "unlocked");
        const closable = gates.filter((g) => g.available && !["closed", "closing"].includes(g.state));
        const secureCount = lockable.length + closable.length;
        const secureLabel = this.t(!closable.length
            ? "lockAll"
            : !lockable.length
                ? "closeAll"
                : "secureAll");
        const lockAllFailure = this.failures.get("*");
        return b `<ha-card class=${this.config.appearance}>
      <div class="title">${this.config.title ?? this.t("title")}</div>
      <div class="hero sev-${tone}">
        <span class="circ big">${icon(HERO_ICON[tone])}</span>
        <div class="hero-text">
          <div class="headline">
            ${all.length ? this.headline(all) : this.t("nothing")}
          </div>
          ${this.lastEvent()}
        </div>
      </div>
      ${doors.length
            ? b `<section class="group" aria-label=${this.t("doors")}>
              <h3>${this.t("doors")}</h3>
              ${doors.map((d) => this.renderRow(d))}
            </section>`
            : A}
      ${gates.length
            ? b `<section class="group" aria-label=${this.t("gates")}>
              <h3>${this.t("gates")}</h3>
              ${gates.map((g) => this.renderRow(g))}
            </section>`
            : A}
      ${secureCount > 1
            ? b `<button
              class="lock-all"
              data-lock-all
              ?disabled=${this.pending.size > 0}
              @click=${() => this.run("*", secureLabel, [
                ["lock", lockable.map((d) => d.entity)],
                ["close", closable.map((g) => g.entity)],
            ].filter(([, entities]) => entities.length))}
            >
              ${icon(this.pending.has("*") ? "spinner" : "locked", this.pending.has("*") ? "spin" : "")}
              ${secureLabel} (${secureCount})
            </button>`
            : A}
      ${lockAllFailure
            ? b `<p class="note sev-problem" role="alert">
              ${icon("warning", "s")}${lockAllFailure}
            </p>`
            : A}
    </ha-card>`;
    }
}
AccessControlCard.styles = styles;
customElements.define("access-control-card", AccessControlCard);
// Card-picker metadata has no hass context, so it stays English.
const registry = window;
registry.customCards ?? (registry.customCards = []);
registry.customCards.push({
    type: "access-control-card",
    name: "Access Control",
    description: "The house's doors and gates: status, lock, unlock and gate control",
    preview: true,
    documentationURL: "https://github.com/mvheimburg/lovelace-access-control",
});

export { AccessControlCard };
//# sourceMappingURL=access-control-card.js.map
