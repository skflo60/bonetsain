(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-cba31a1c"],{"0a9f":function(t,e,a){"use strict";var n=a("a54d"),r=a.n(n);r.a},1799:function(t,e,a){"use strict";var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.totalPages>1?a("div",{staticClass:"mb-4 mt-6"},[a("div",{staticClass:"flex align-center justify-center"},[a("div",{staticClass:"flex"},[t.isFirst?a("PaginationItem",{staticClass:"rounded rounded-r-none",on:{"hanlder-click":function(e){return t.handlerPage(t._currentPage-1)}}},[t._v("\n        Previous\n      ")]):t._e()],1),a("div",{staticClass:"flex"},t._l(t._pages,function(e){return a("PaginationItem",{key:e,class:{"cursor-default text-white pointer-events-none bg-blue-dark":t._currentPage===e},on:{"hanlder-click":function(a){return t.handlerPage(e)}}},[t._v("\n        "+t._s(e)+"\n      ")])}),1),a("div",{staticClass:"flex"},[t.isLast?a("PaginationItem",{on:{"hanlder-click":function(e){return t.handlerPage(t._currentPage+1)}}},[t._v("\n        Next\n      ")]):t._e()],1)])]):t._e()},r=[],i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("a",{staticClass:"inline-block no-underline text-grey-darker bg-white p-2 px-3 shadow-md",attrs:{href:"#"},on:{click:function(e){return e.preventDefault(),t.handlerClick(e)}}},[t._t("default")],2)},s=[],c={methods:{handlerClick:function(){this.$emit("hanlder-click")}}},o=c,u=a("2877"),d=Object(u["a"])(o,i,s,!1,null,null,null),l=d.exports,g={props:["currentPage","pageLimit","pages"],components:{PaginationItem:l},data:function(){return{isHasTotalPages:!1,isFirst:!1,isLast:!1,_pages:[]}},computed:{_currentPage:function(){return this.currentPage},_pageLimit:function(){return this.pageLimit||8},totalPages:function(){return this.pages&&!this.isHasTotalPages&&(this.isHasTotalPages=!0,this.pagination(1,this.pages)),this.pages}},methods:{handlerPage:function(t){this.$emit("handler-page",t),this.pagination(t,this.totalPages)},pagination:function(t,e){var a,n;this._pages=[];n=a=Math.min(t,e);for(var r=1;r<this._pageLimit&&r<e;)n>1&&(n--,r++),r<this._pageLimit&&a<e&&(a++,r++);for(var i=n;i<=a;i++)this._pages.push(i);this.isFirst=-1===this._pages.indexOf(1),this.isLast=-1===this._pages.indexOf(e)}}},f=g,p=Object(u["a"])(f,n,r,!1,null,"2778d1cf",null);e["a"]=p.exports},"1e35":function(t,e,a){"use strict";var n=a("7424"),r="/products";e["a"]={getProducts:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return Object(n["a"])().get("".concat(r),{params:t})},getProductsById:function(t){return Object(n["a"])().get("".concat(r,"/").concat(t))},getProductsRelatedById:function(t){return Object(n["a"])().get("".concat(r,"/").concat(t,"/related"))},getProductsByPage:function(t){return Object(n["a"])().get("".concat(r,"?page=").concat(t))}}},"77ca":function(t,e,a){"use strict";a("7f7f");var n=a("f499"),r=a.n(n),i=a("cebc"),s=a("2f62"),c=a("fa7d");e["a"]={methods:Object(i["a"])({},Object(s["b"])(["addCart","incrementCart"]),{addToCart:function(t){var e=JSON.parse(localStorage.getItem("cart"))||[];if(e.length){var a=Object(c["a"])(e,t._id);a?(this.incrementCart(a),localStorage.setItem("cart",r()(e))):this.updateToCart(e,t)}else this.updateToCart(e,t)},updateToCart:function(t,e){var a={id:e._id,image:e.image,name:e.name,price:e.price,subtotal:1*e.price,qty:1};t.push(a),this.addCart(a),localStorage.setItem("cart",r()(t))}})}},a21f:function(t,e,a){var n=a("584a"),r=n.JSON||(n.JSON={stringify:JSON.stringify});t.exports=function(t){return r.stringify.apply(r,arguments)}},a54d:function(t,e,a){},bb51:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"container max-w-xl mx-auto mb-4 px-4"},[a("div",{staticClass:"flex flex-wrap"},[a("div",{staticClass:"w-full"},[a("div",{staticClass:"cards"},t._l(t.products,function(t){return a("div",{key:t._id,staticClass:"flex shadow-lg rounded-lg overflow-hidden bg-white"},[a("Product",{attrs:{product:t}})],1)}),0),a("div",{staticClass:"text-center mt-6"},[t.isLoadMoreBtn?a("a",{staticClass:"w-full rounded inline-block px-4 py-3 bg-blue-dark text-white no-underline rounded",attrs:{href:"#"},on:{click:function(e){return e.preventDefault(),t.loadMoreProduct(e)}}},[t._v("Load more")]):t._e()])])])])},r=[],i=a("1e35"),s=a("be6f"),c=a("1799"),o=a("1d9f"),u={components:{Product:s["a"],Pagination:c["a"],Categories:o["a"]},data:function(){return{bottom:!1,products:[],currentPage:0,pages:0,isLoadMoreBtn:!1,isLoadMoreFinish:!1}},watch:{bottom:function(t){t&&!this.isLoadMoreFinish&&this.loadMoreProduct()}},created:function(){var t=this;i["a"].getProducts().then(function(e){t.products=e.data.products,t.currentPage=e.data.currentPage,t.pages=e.data.pages})},mounted:function(){var t=this;window.addEventListener("scroll",function(){t.bottom=t.bottomVisible()})},methods:{bottomVisible:function(){var t=window.scrollY,e=document.documentElement.clientHeight,a=document.documentElement.scrollHeight,n=e+t>=a;return n||a<e},clickHandlerPage:function(t){var e=this;i["a"].getProductsByPage(t).then(function(t){var a=t.data;e.products=a.products,e.currentPage=a.currentPage,e.pages=a.pages})},loadMoreProduct:function(){var t=this,e=this.currentPage+1;i["a"].getProductsByPage(e).then(function(a){var n=a.data;if(!n.products.length)return t.isLoadMoreBtn=!1,void(t.isLoadMoreFinish=!0);n.products.forEach(function(e){t.products.push(e)}),t.currentPage=e})}}},d=u,l=a("2877"),g=Object(l["a"])(d,n,r,!1,null,"535aa7d2",null);e["default"]=g.exports},be6f:function(t,e,a){"use strict";var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"product"},[a("router-link",{staticClass:"block min-height",attrs:{tag:"a",to:{name:"product",params:{id:t.product._id}}}},[a("img",{attrs:{src:t.product.image,alt:t.product.name}})]),a("div",{staticClass:"p-3"},[a("h3",{staticClass:"text-lg mb-1 leading-tight font-medium"},[t._v(t._s(t.product.name))]),a("p",{staticClass:"font-semibold text-md mb-2"},[t._v(t._s(t._f("currency")(t.product.price)))]),a("p",{staticClass:"text-sm text-grey-darker mb-2"},[t._v(t._s(t.product.description.substring(0,50)))]),a("button",{staticClass:"block w-full border shadow p-2 rounded mt-2 hover:bg-blue-dark hover:text-white",on:{click:function(e){return t.addToCart(t.product)}}},[t._v("\n      Ajouter au panier\n    ")])])],1)},r=[],i=a("77ca"),s={props:["product"],mixins:[i["a"]]},c=s,o=(a("0a9f"),a("2877")),u=Object(o["a"])(c,n,r,!1,null,"292d7737",null);e["a"]=u.exports},f499:function(t,e,a){t.exports=a("a21f")}}]);
//# sourceMappingURL=chunk-cba31a1c.c5f4a4af.js.map