(()=>{var o={798:function(o,i,t){o=t.nmd(o),function(t,e){"use strict";var r={};t.PubSub?(r=t.PubSub,console.warn("PubSub already loaded, using existing version")):(t.PubSub=r,function(o){var i={},t=-1;function e(o,i,t){try{o(i,t)}catch(o){setTimeout(function(o){return function(){throw o}}(o),0)}}function r(o,i,t){o(i,t)}function n(o,t,n,d){var v,c=i[t],l=d?r:e;if(Object.prototype.hasOwnProperty.call(i,t))for(v in c)Object.prototype.hasOwnProperty.call(c,v)&&l(c[v],o,n)}function d(o){var t=String(o);return Boolean(Object.prototype.hasOwnProperty.call(i,t)&&function(o){var i;for(i in o)if(Object.prototype.hasOwnProperty.call(o,i))return!0;return!1}(i[t]))}function v(o,i,t,e){var r=function(o,i,t){return function(){var e=String(o),r=e.lastIndexOf(".");for(n(o,o,i,t);-1!==r;)r=(e=e.substr(0,r)).lastIndexOf("."),n(o,e,i,t);n(o,"*",i,t)}}(o="symbol"==typeof o?o.toString():o,i,e);return!!function(o){for(var i=String(o),t=d(i)||d("*"),e=i.lastIndexOf(".");!t&&-1!==e;)e=(i=i.substr(0,e)).lastIndexOf("."),t=d(i);return t}(o)&&(!0===t?r():setTimeout(r,0),!0)}o.publish=function(i,t){return v(i,t,!1,o.immediateExceptions)},o.publishSync=function(i,t){return v(i,t,!0,o.immediateExceptions)},o.subscribe=function(o,e){if("function"!=typeof e)return!1;o="symbol"==typeof o?o.toString():o,Object.prototype.hasOwnProperty.call(i,o)||(i[o]={});var r="uid_"+String(++t);return i[o][r]=e,r},o.subscribeAll=function(i){return o.subscribe("*",i)},o.subscribeOnce=function(i,t){var e=o.subscribe(i,(function(){o.unsubscribe(e),t.apply(this,arguments)}));return o},o.clearAllSubscriptions=function(){i={}},o.clearSubscriptions=function(o){var t;for(t in i)Object.prototype.hasOwnProperty.call(i,t)&&0===t.indexOf(o)&&delete i[t]},o.countSubscriptions=function(o){var t,e,r=0;for(t in i)if(Object.prototype.hasOwnProperty.call(i,t)&&0===t.indexOf(o)){for(e in i[t])r++;break}return r},o.getSubscriptions=function(o){var t,e=[];for(t in i)Object.prototype.hasOwnProperty.call(i,t)&&0===t.indexOf(o)&&e.push(t);return e},o.unsubscribe=function(t){var e,r,n,d="string"==typeof t&&(Object.prototype.hasOwnProperty.call(i,t)||function(o){var t;for(t in i)if(Object.prototype.hasOwnProperty.call(i,t)&&0===t.indexOf(o))return!0;return!1}(t)),v=!d&&"string"==typeof t,c="function"==typeof t,l=!1;if(!d){for(e in i)if(Object.prototype.hasOwnProperty.call(i,e)){if(r=i[e],v&&r[t]){delete r[t],l=t;break}if(c)for(n in r)Object.prototype.hasOwnProperty.call(r,n)&&r[n]===t&&(delete r[n],l=!0)}return l}o.clearSubscriptions(t)}}(r)),void 0!==o&&o.exports&&(i=o.exports=r),i.PubSub=r,o.exports=i=r}("object"==typeof window&&window||this)}},i={};function t(e){var r=i[e];if(void 0!==r)return r.exports;var n=i[e]={id:e,loaded:!1,exports:{}};return o[e].call(n.exports,n,n.exports,t),n.loaded=!0,n.exports}t.n=o=>{var i=o&&o.__esModule?()=>o.default:()=>o;return t.d(i,{a:i}),i},t.d=(o,i)=>{for(var e in i)t.o(i,e)&&!t.o(o,e)&&Object.defineProperty(o,e,{enumerable:!0,get:i[e]})},t.o=(o,i)=>Object.prototype.hasOwnProperty.call(o,i),t.nmd=o=>(o.paths=[],o.children||(o.children=[]),o),(()=>{"use strict";var o=t(798),i=t.n(o);const e=()=>{let o=[],t=0,e=[];for(let i=0;i<10;i++){o[i]=[];for(let t=0;t<10;t++)o[i][t]=void 0}return{getBoard:()=>o,addShip:(i,r,n,d=0)=>{if(e[t]=(o=>{let i=0;return{length:o,getHits:()=>i,isSunk:()=>i>=o,hit:()=>{i++}}})(i),0===d)for(let e=0;e<i;e++)o[r-e][n]=t;else if(3===d)for(let e=0;e<i;e++)o[r][n+e]=t;else if(6===d)for(let e=0;e<i;e++)o[r+e][n]=t;else if(9===d)for(let e=0;e<i;e++)o[r][n-e]=t;t++},getCoordinateStatus:(i,t)=>o[i][t],receiveAttack:(t,r)=>{if(void 0===o[t][r])o[t][r]=-1,i().publish("missed_shot");else{let i=o[t][r];e[i].hit(),o[t][r]=-2}},getShip:o=>e[o],checkAllSunk:()=>{for(let o=0;o<e.length;o++)if(!e[o].isSunk())return!1;return!0}}};function r(o){for(let i=0;i<10;i++){let i=document.createElement("div");i.className="row";for(let o=0;o<10;o++){let o=document.createElement("div");o.className="cell",i.appendChild(o)}o.appendChild(i)}}const n=()=>{let o=!1;const t=()=>o=!o;return i().subscribe("missed_shot",t()),{isTurn:()=>o,changeStatus:t,hit:o=>{let i,t,e=o.getBoard();do{i=Math.floor(10*Math.random()),t=Math.floor(10*Math.random())}while(-1===e[i][t]||-2===e[i][t]);return[i,t]}}};(()=>{n(),e(),n(),e();let o=document.querySelector(".gameboards").children[0];r(o),r(document.querySelector(".gameboards").children[1]),function(o,i,t=0){for(let e=0;e<10;e++){let r=i.children[e];for(let i=0;i<10;i++)void 0===o[e][i]?r.children[i].style.backgroundColor="white":-1===o[e][i]?r.children[i].style.backgroundColor="red":-2===o[e][i]?r.children[i].style.backgroundColor="grey":0===t&&(r.children[i].style.backgroundColor="black")}}([[-1,-2,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[1,1,1,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[2,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[2,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0],[void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0]],o)})()})()})();