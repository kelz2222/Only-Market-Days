import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Upload, CheckCircle } from 'lucide-react'
import { useAgent } from './AgentApp'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { slug: 'vegetables', name: '🌿 Leafy Vegetables' },
  { slug: 'staples', name: '🌾 Staples & Swallow' },
  { slug: 'palm', name: '🫙 Palm Produce' },
  { slug: 'protein', name: '🐟 Dried Protein' },
  { slug: 'meat', name: '🐔 Dressed Meat' },
  { slug: 'spices', name: '🌶️ Spices & Condiments' },
  { slug: 'fruits', name: '🍌 Fruits & Plantain' },
  { slug: 'seasonal', name: '🍊 Seasonal Fruits' },
  { slug: 'nuts', name: '🌰 Nuts & Kola' },
  { slug: 'grains', name: '🌽 Grains & Corn' },
]

const UNITS = ['bunch', 'kg', 'keg', 'bag', 'piece', 'dozen', 'mudu', 'wrap', 'tuber', 'half', 'litre']

export default function AgentUpload() {
  const { agent } = useAgent()
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({ name: '', category_slug: 'vegetables', price: '', unit: 'bunch', quantity_available: '', is_seasonal: false, is_bulk: false, is_preorder_only: false, season_note: '', description: '' })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.quantity_available) { toast.error('Fill in product name, price, and quantity'); return }
    const priceKobo = Math.round(parseFloat(form.price) * 100)
    if (isNaN(priceKobo) || priceKobo <= 0) { toast.error('Enter a valid price in Naira'); return }
    setLoading(true)
    try {
      let imageUrl = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `products/${Date.now()}.${ext}`
        const { data: imgData, error: imgError } = await supabase.storage.from('product-images').upload(fileName, imageFile)
        if (!imgError && imgData) {
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }
      const { error } = await supabase.from('products').insert({
        name: form.name, price: priceKobo, unit: form.unit, quantity_available: parseInt(form.quantity_available),
        is_seasonal: form.is_seasonal, is_bulk: form.is_bulk, is_preorder_only: form.is_preorder_only,
        season_note: form.season_note || null, description: form.description || null,
        image_url: imageUrl, uploaded_by: agent?.id, active: true,
      })
      if (error) throw error
      setUploaded(true)
      toast.success(`${form.name} uploaded!`)
      setTimeout(() => {
        setUploaded(false)
        setForm({ name: '', category_slug: 'vegetables', price: '', unit: 'bunch', quantity_available: '', is_seasonal: false, is_bulk: false, is_preorder_only: false, season_note: '', description: '' })
        setImageFile(null); setImagePreview(null)
      }, 2000)
    } catch (err) { toast.error('Upload failed. Try again.') }
    setLoading(false)
  }

  if (uploaded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <CheckCircle size={72} color="var(--green-muted)" />
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28 }}>Product Listed!</h2>
        <p style={{ color: 'var(--green-muted)', fontSize: 15 }}>Buyers can now see it on the app</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 60 }}>
      <div style={{ background: 'var(--green)', padding: '20px 16px 24px' }}>
        <Link to="/agent" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-muted)', fontSize: 14, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 24, fontWeight: 700 }}>Upload Product</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Take a photo, set the price, go live immediately</p>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, marginBottom: 14 }}>Product Photo</h3>
          <label htmlFor="img-upload" style={{ display: 'block', border: '2px dashed var(--green-muted)', borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden' }}>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div>
                <Camera size={32} color="var(--green-muted)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>Take or upload photo</div>
                <div style={{ fontSize: 12, color: '#888' }}>Tap to use your camera or gallery</div>
              </div>
            )}
          </label>
          <input id="img-upload" type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
          {imagePreview && <button onClick={() => { setImageFile(null); setImagePreview(null) }} style={{ marginTop: 10, background: 'none', color: '#888', fontSize: 13, textDecoration: 'underline', display: 'block' }}>Remove photo</button>}
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, marginBottom: 16 }}>Product Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Product Name *</label>
              <input name="name" placeholder="e.g. Fresh Ugu Leaves" value={form.name} onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 15, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Category *</label>
              <select name="category_slug" value={form.category_slug} onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white' }}>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Price (₦) *</label>
                <input name="price" type="number" placeholder="e.g. 800" value={form.price} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 16, outline: 'none', fontFamily: 'DM Mono, monospace' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Unit *</label>
                <select name="unit" value={form.unit} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white' }}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Quantity Available *</label>
              <input name="quantity_available" type="number" placeholder="How many do you have?" value={form.quantity_available} onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 15, outline: 'none' }} />
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>💡 List fewer than actual — always keep a buffer</div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Description (optional)</label>
              <textarea name="description" placeholder="e.g. Leaves stripped from stalk, very fresh" value={form.description} onChange={handleChange}
                rows={2} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', resize: 'none' }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, marginBottom: 14 }}>Product Flags</h3>
          {[
            { name: 'is_seasonal', label: '⭐ Seasonal item', desc: 'Currently in season — show season badge' },
            { name: 'is_bulk', label: '📦 Bulk item', desc: 'Heavy/large — applies bulk delivery rate' },
            { name: 'is_preorder_only', label: '🌅 Pre-order only', desc: 'Not available for same-day orders (e.g. dressed chicken)' },
          ].map(({ name, label, desc }) => (
            <label key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--green)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{desc}</div>
              </div>
            </label>
          ))}
          {form.is_seasonal && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Season Note</label>
              <input name="season_note" placeholder="e.g. Peak season — cheapest it will be all year" value={form.season_note} onChange={handleChange}
                style={{ width: '100%', padding: '11px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none' }} />
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 17, opacity: loading ? 0.7 : 1 }}>
          <Upload size={20} />{loading ? 'Uploading...' : 'List Product Now'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12 }}>Product appears live on the buyer app immediately after upload</p>
      </div>
    </div>
  )
}
