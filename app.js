// Simple test e-commerce client-side logic
const STORAGE_KEY = 'test-ecom-cart-v1'

const products = [
  {id: 'p1', title: 'Classic Mug', price: 12.5, img: 'https://via.placeholder.com/400x250?text=Mug'},
  {id: 'p2', title: 'Notebook', price: 8.75, img: 'https://via.placeholder.com/400x250?text=Notebook'},
  {id: 'p3', title: 'T-Shirt', price: 19.99, img: 'https://via.placeholder.com/400x250?text=T-Shirt'},
  {id: 'p4', title: 'Wireless Earbuds', price: 45.0, img: 'https://via.placeholder.com/400x250?text=Earbuds'},
  {id: 'p5', title: 'Water Bottle', price: 14.0, img: 'https://via.placeholder.com/400x250?text=Bottle'},
  {id: 'p6', title: 'Desk Lamp', price: 29.5, img: 'https://via.placeholder.com/400x250?text=Lamp'}
]

let cart = loadCart()

function saveCart(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
}

function loadCart(){
  try{const raw = localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):{}}
  catch(e){return {}}
}

function renderProducts(list = products){
  const container = document.getElementById('products')
  container.innerHTML = ''
  list.forEach(p => {
    const el = document.createElement('article')
    el.className = 'product'
    el.innerHTML = `
      <img src="${p.img}" alt="${p.title}" />
      <div class="product-body">
        <h3>${p.title}</h3>
        <div class="meta">ID: ${p.id}</div>
        <div class="price">$${p.price.toFixed(2)}</div>
        <div class="actions">
          <button class="add">Add to cart</button>
          <button class="more">Details</button>
        </div>
      </div>
    `
    el.querySelector('.add').addEventListener('click', () => addToCart(p.id))
    container.appendChild(el)
  })
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1
  saveCart(); renderCart(); showToast('Added to cart')
}

function removeFromCart(id){
  delete cart[id]; saveCart(); renderCart();
}

function updateQty(id, qty){
  if(qty <= 0) removeFromCart(id)
  else { cart[id] = qty; saveCart(); renderCart() }
}

function renderCart(){
  const items = document.getElementById('cart-items')
  items.innerHTML = ''
  const ids = Object.keys(cart)
  let total = 0
  ids.forEach(id => {
    const p = products.find(x=>x.id===id)
    if(!p) return
    const qty = cart[id]
    total += p.price * qty
    const row = document.createElement('div')
    row.className = 'cart-item'
    row.innerHTML = `
      <img src="${p.img}" alt="${p.title}" />
      <div class="meta">
        <div>${p.title}</div>
        <div class="meta">$${p.price.toFixed(2)} × <input type="number" min="0" value="${qty}" data-id="${id}" style="width:60px" /></div>
      </div>
      <div>
        <div style="text-align:right;font-weight:700">$${(p.price*qty).toFixed(2)}</div>
        <button data-remove="${id}">Remove</button>
      </div>
    `
    row.querySelector('input').addEventListener('change', (e)=>{
      updateQty(id, Number(e.target.value) || 0)
    })
    row.querySelector('[data-remove]').addEventListener('click', ()=> removeFromCart(id))
    items.appendChild(row)
  })
  document.getElementById('cart-total').textContent = total.toFixed(2)
  document.getElementById('cart-count').textContent = ids.reduce((s,id)=>s+cart[id],0)
}

function clearCart(){ cart = {}; saveCart(); renderCart(); }

function checkout(){
  const ids = Object.keys(cart)
  if(ids.length===0){ showToast('Cart is empty'); return }
  // Fake checkout for test
  const lines = ids.map(id=>{
    const p = products.find(x=>x.id===id)
    return `${p.title} × ${cart[id]}`
  }).join('\n')
  alert('Simulated checkout:\n' + lines)
  clearCart(); showToast('Checkout complete (simulated)')
}

function toggleCart(open){
  const drawer = document.getElementById('cart-drawer')
  drawer.setAttribute('aria-hidden', open? 'false' : 'true')
}

function showToast(msg, ms=2000){
  const t = document.getElementById('toast')
  t.textContent = msg; t.hidden = false
  setTimeout(()=>{ t.hidden = true }, ms)
}

// wire up
window.addEventListener('DOMContentLoaded', ()=>{
  renderProducts()
  renderCart()
  document.getElementById('open-cart').addEventListener('click', ()=>toggleCart(true))
  document.getElementById('close-cart').addEventListener('click', ()=>toggleCart(false))
  document.getElementById('checkout').addEventListener('click', ()=>checkout())
  document.getElementById('clear-cart').addEventListener('click', ()=>{ if(confirm('Clear cart?')) clearCart() })
  document.getElementById('search').addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase()
    renderProducts(products.filter(p=>p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)))
  })
})
