
const products = [
{id:1,name:"Cloud Puffer",category:"Jackets",price:149,old:199,img:"assets/puffer-black.svg",badge:"NEW",desc:"A cropped, high-volume puffer with a clean neckline and sculpted silhouette.",sizes:["XS","S","M","L","XL"]},
{id:2,name:"Signal Puffer",category:"Jackets",price:159,img:"assets/puffer-orange.svg",badge:"DROP 06",desc:"The same sculpted puffer in a saturated signal orange.",sizes:["S","M","L","XL"]},
{id:3,name:"Chrome Puffer",category:"Jackets",price:169,img:"assets/puffer-silver.svg",desc:"Soft metallic outerwear designed to catch light without feeling loud.",sizes:["XS","S","M","L"]},
{id:4,name:"Cloud Hoodie",category:"Tops",price:89,img:"assets/hoodie-cream.svg",badge:"BESTSELLER",desc:"Oversized hoodie with dropped shoulders and a quiet, architectural fit.",sizes:["S","M","L","XL"]},
{id:5,name:"Shadow Hoodie",category:"Tops",price:92,img:"assets/hoodie-charcoal.svg",desc:"Charcoal essential with dense volume and soft structure.",sizes:["S","M","L","XL"]},
{id:6,name:"Form Tee / White",category:"Tops",price:49,img:"assets/tee-white.svg",desc:"Heavyweight everyday tee with a square, relaxed silhouette.",sizes:["XS","S","M","L","XL"]},
{id:7,name:"Form Tee / Black",category:"Tops",price:49,img:"assets/tee-black.svg",desc:"Minimal black tee cut wide through the body.",sizes:["XS","S","M","L","XL"]},
{id:8,name:"Stone Trousers",category:"Bottoms",price:119,img:"assets/pants-stone.svg",badge:"NEW",desc:"Wide-leg trouser with a clean waist and soft drape.",sizes:["28","30","32","34","36"]}
];

let state = {
  cart: JSON.parse(localStorage.getItem("nf_cart")||"{}"),
  wish: JSON.parse(localStorage.getItem("nf_wish")||"[]"),
  filter:"All",sort:"featured",product:null,size:null
};

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const views=$$(".view");

window.addEventListener("load",()=>setTimeout(()=>$("#loader").classList.add("done"),900));

document.addEventListener("mousemove",e=>{
  $(".cursor-dot").style.transform=`translate(${e.clientX-2}px,${e.clientY-2}px)`;
  $(".cursor-ring").style.transform=`translate(${e.clientX-17}px,${e.clientY-17}px)`;
});

function save(){
  localStorage.setItem("nf_cart",JSON.stringify(state.cart));
  localStorage.setItem("nf_wish",JSON.stringify(state.wish));
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1400)}

function route(name, productId=null){
  const panel=$("#transitionPanel"); panel.classList.remove("go"); void panel.offsetWidth; panel.classList.add("go");
  setTimeout(()=>{
    views.forEach(v=>v.classList.toggle("active",v.dataset.view===name));
    if(name==="shop") renderShop();
    if(name==="product" && productId){state.product=products.find(p=>p.id===productId); renderDetail();}
    window.scrollTo({top:0,behavior:"instant"});
  },360);
}
$$("[data-route]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();route(el.dataset.route)}));
$$("[data-filter-route]").forEach(el=>el.addEventListener("click",()=>{state.filter=el.dataset.filterRoute;closeMenu();route("shop")}));

function productCard(p){
  const el=document.createElement("article");el.className="product-card";
  el.innerHTML=`${p.badge?`<span class="badge">${p.badge}</span>`:""}<button class="quick" aria-label="Wishlist">${state.wish.includes(p.id)?"♥":"♡"}</button>
  <div class="visual"><img src="${p.img}" alt="${p.name}"></div>
  <div class="meta"><div><h3>${p.name}</h3><p>${p.category}</p></div><div class="price">$${p.price}</div></div>`;
  el.querySelector(".visual").addEventListener("click",()=>route("product",p.id));
  el.querySelector(".meta").addEventListener("click",()=>route("product",p.id));
  el.querySelector(".quick").addEventListener("click",e=>{e.stopPropagation();toggleWish(p.id);renderAll()});
  return el;
}
function renderFeatured(){
  const g=$("#featuredGrid");g.innerHTML="";products.slice(0,4).forEach(p=>g.appendChild(productCard(p)));
}
function renderShop(){
  let list=[...products];
  if(state.filter!=="All")list=list.filter(p=>p.category===state.filter);
  if(state.sort==="low")list.sort((a,b)=>a.price-b.price);
  if(state.sort==="high")list.sort((a,b)=>b.price-a.price);
  $("#shopGrid").innerHTML="";list.forEach(p=>$("#shopGrid").appendChild(productCard(p)));
  $$("#filterRow button").forEach(b=>b.classList.toggle("active",b.dataset.filter===state.filter));
}
$("#filterRow").addEventListener("click",e=>{if(e.target.dataset.filter){state.filter=e.target.dataset.filter;renderShop()}});
$("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;renderShop()});
renderFeatured();renderShop();

function renderDetail(){
  const p=state.product; state.size=null;
  $("#detailImg").src=p.img;$("#detailName").textContent=p.name;$("#detailCategory").textContent=p.category;
  $("#detailPrice").innerHTML=`$${p.price}${p.old?` <del style="color:#999;margin-left:8px">$${p.old}</del>`:""}`;
  $("#detailDesc").textContent=p.desc;
  const box=$("#sizes");box.innerHTML="";p.sizes.forEach(s=>{const b=document.createElement("button");b.className="size";b.textContent=s;b.onclick=()=>{$$(".size").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.size=s};box.appendChild(b)});
  $("#detailWish").textContent=state.wish.includes(p.id)?"♥":"♡";
}
$("#detailAdd").addEventListener("click",()=>{if(!state.size)return toast("Choose a size first");addCart(state.product.id,state.size)});
$("#detailWish").addEventListener("click",()=>{toggleWish(state.product.id);$("#detailWish").textContent=state.wish.includes(state.product.id)?"♥":"♡"});
$$(".accordion button").forEach(b=>b.addEventListener("click",()=>b.nextElementSibling.classList.toggle("open")));

function key(id,size){return `${id}|${size}`}
function addCart(id,size){
  const k=key(id,size);state.cart[k]=(state.cart[k]||0)+1;save();updateCounts();renderCart();toast("Added to bag");
}
function changeQty(k,d){state.cart[k]=(state.cart[k]||0)+d;if(state.cart[k]<=0)delete state.cart[k];save();updateCounts();renderCart()}
function toggleWish(id){state.wish=state.wish.includes(id)?state.wish.filter(x=>x!==id):[...state.wish,id];save();updateCounts();renderWish()}
function updateCounts(){
  $("#cartCount").textContent=Object.values(state.cart).reduce((a,b)=>a+b,0);
  $("#wishCount").textContent=state.wish.length;
}
function renderCart(){
  const box=$("#cartItems");box.innerHTML="";let total=0;
  Object.entries(state.cart).forEach(([k,q])=>{const [id,size]=k.split("|");const p=products.find(x=>x.id==id);if(!p)return;total+=p.price*q;
    const d=document.createElement("div");d.className="cart-item";d.innerHTML=`<img src="${p.img}"><div class="item-info"><h4>${p.name}</h4><small>Size ${size} · $${p.price}</small></div><div class="qty"><button>−</button><span>${q}</span><button>+</button></div>`;
    const bs=d.querySelectorAll("button");bs[0].onclick=()=>changeQty(k,-1);bs[1].onclick=()=>changeQty(k,1);box.appendChild(d);
  });
  if(!box.children.length)box.innerHTML=`<div class="empty">Your bag is empty.</div>`;
  $("#cartTotal").textContent=`$${total}`;
}
function renderWish(){
  const box=$("#wishItems");box.innerHTML="";
  state.wish.forEach(id=>{const p=products.find(x=>x.id===id);const d=document.createElement("div");d.className="wish-item";d.innerHTML=`<img src="${p.img}"><div class="item-info"><h4>${p.name}</h4><small>$${p.price}</small></div><button class="remove-wish">×</button>`;d.querySelector("img").onclick=()=>{closeDrawers();route("product",p.id)};d.querySelector("button").onclick=()=>{toggleWish(p.id);renderAll()};box.appendChild(d)});
  if(!box.children.length)box.innerHTML=`<div class="empty">Nothing saved yet.</div>`;
}
function renderAll(){renderFeatured();renderShop();renderCart();renderWish();updateCounts()}
renderAll();

function openDrawer(which){closeDrawers();$("#veil").classList.add("show");$(which).classList.add("open")}
function closeDrawers(){$$(".drawer").forEach(d=>d.classList.remove("open"));$("#veil").classList.remove("show")}
$("#cartBtn").onclick=()=>openDrawer("#cartDrawer");$("#wishlistBtn").onclick=()=>openDrawer("#wishDrawer");$("#veil").onclick=()=>{closeDrawers();closeMenu()};$$("[data-close]").forEach(b=>b.onclick=closeDrawers);

function openMenu(){$("#sideMenu").classList.add("open");$("#veil").classList.add("show")}
function closeMenu(){$("#sideMenu").classList.remove("open");$("#veil").classList.remove("show")}
$("#menuBtn").onclick=openMenu;$("#menuClose").onclick=closeMenu;

$("#searchBtn").onclick=()=>{$("#searchOverlay").classList.add("open");setTimeout(()=>$("#searchInput").focus(),300)};
$("#searchClose").onclick=()=>$("#searchOverlay").classList.remove("open");
$("#searchInput").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase().trim(),box=$("#searchResults");box.innerHTML="";if(!q)return;
  products.filter(p=>(p.name+p.category).toLowerCase().includes(q)).forEach(p=>{const b=document.createElement("button");b.className="search-result";b.innerHTML=`<strong>${p.name}</strong><br><small>${p.category} · $${p.price}</small>`;b.onclick=()=>{$("#searchOverlay").classList.remove("open");route("product",p.id)};box.appendChild(b)})
});

$$(".tone").forEach(b=>b.addEventListener("click",()=>{
  $$(".tone").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  const img=$("#heroProduct");img.style.opacity=0;img.style.transform="scale(.88) rotate(-6deg)";
  setTimeout(()=>{img.src=b.dataset.src;$("#hero").dataset.tone=b.dataset.bg;img.style.opacity=1;img.style.transform=""},220)
}));

$("#checkoutBtn").onclick=()=>{
  if(!Object.keys(state.cart).length)return toast("Your bag is empty");
  closeDrawers();renderCheckout();$("#checkout").classList.add("open")
};
$("#checkoutClose").onclick=()=>$("#checkout").classList.remove("open");
function renderCheckout(){
  let total=0,html="";Object.entries(state.cart).forEach(([k,q])=>{const [id,size]=k.split("|");const p=products.find(x=>x.id==id);total+=p.price*q;html+=`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #ffffff18"><span>${p.name} / ${size} × ${q}</span><b>$${p.price*q}</b></div>`});html+=`<div style="display:flex;justify-content:space-between;padding:20px 0;font-size:22px"><span>Total</span><b>$${total}</b></div>`;$("#checkoutSummary").innerHTML=html
}
$("#checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();state.cart={};save();updateCounts();renderCart();$("#checkout").classList.remove("open");toast("Demo order placed ✓");e.target.reset()
});
