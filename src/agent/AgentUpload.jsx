import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Upload, CheckCircle, Image } from 'lucide-react'
import { useAgent } from './AgentApp'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { slug: 'vegetables', name: '🌿 Leafy Vegetables', emoji: '🌿' },
  { slug: 'staples', name: '🌾 Staples & Swallow', emoji: '🌾' },
  { slug: 'palm', name: '🫙 Palm Produce', emoji: '🫙' },
  { slug: 'protein', name: '🐟 Dried Protein', emoji: '🐟' },
  { slug: 'meat', name: '🐔 Dressed Meat', emoji: '🐔' },
  { slug: 'spices', name: '🌶️ Spices & Condiments', emoji: '🌶️' },
  { slug: 'fruits', name: '🍌 Fruits & Plantain', emoji: '🍌' },
  { slug: 'seasonal', name: '🍊 Seasonal Fruits', emoji: '🍊' },
  { slug: 'nuts', name: '🌰 Nuts & Kola', emoji: '🌰' },
  { slug: 'grains', name: '🌽 Grains & Corn', emoji: '🌽' },
]

const UNITS = ['bunch', 'kg', 'keg', 'bag', 'piece', 'dozen', 'mudu', 'wrap', 'tuber', 'half', 'litre']

export default function AgentUpload() {
  const { agent } = useAgent()
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [marketDayId, setMarketDayId] = useState(null)
  const [marketId, setMarketId] = useState(null)
  const [marketName, setMarketName] = useState('')
  const [loadingMarket, setLoadingMarket] = useState(true)

  const [form, setForm] = useState({
    name: '',
    category_slug: 'vegetables',
    price: '',
    unit: 'bunch',
    quantity_available: '',
    is_seasonal: false,
    is_bulk: false,
    is_preorder_only: false,
    is_meat: false,
    meat_type: '',
    season_note: '',
    description: '',
  })

  // ── Load the active or upcoming market day on mount ──
  useEffect(() => {
    loadActiveMarketDay()
  }, [])

  async function loadActiveMarketDay() {
    setLoadingMarket(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

      // Look for active market day today or tomorrow
      const { data, error } = await supabase
        .from('market_days')
        .select('id, market_id, market_date, markets(name)')
        .in('market_date', [today, tomorrow])
        .eq('status', 'active')
        .order('market_date', { ascending: true })
        .limit(1)
        .single()

      if (data) {
        setMarketDayId(data.id)
        setMarketId(data.market_id)
        setMarketName(data.markets?.name || '')
      } else {
        // No active market day — agent needs to create one
        // Auto-create for tomorrow using agent's assigned market
        const agentMarketId = agent?.market_id
        if (agentMarketId) {
          const { data: created } = await supabase
            .from('market_days')
            .insert({
              market_id: agentMarketId,
              market_date: tomorrow,
              status: 'active',
            })
            .select('id, market_id, markets(name)')
            .single()

          if (created) {
            setMarketDayId(created.id)
            setMarketId(created.market_id)
            setMarketName(created.markets?.name || '')
          }
        }
      }
    } catch (err) {
      console.error('Market day load error:', err)
    }
    setLoadingMarket(false)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value }
      // Auto-set is_meat when category is meat
      if (name === 'category_slug') {
        updated.is_meat = value === 'meat'
        if (value !== 'meat') updated.meat_type = ''
      }
      return updated
    })
  }

  // ── FIX 1: Remove capture="environment" so gallery opens on mobile ──
  function handleImageGallery(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  function handleImageCamera(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.quantity_available) {
      toast.error('Fill in product name, price, and quantity')
      return
    }
    if (!marketDayId || !marketId) {
      toast.error('No active market day found. Contact the owner.')
      return
    }

    const priceKobo = Math.round(parseFloat(form.price) * 100)
    if (isNaN(priceKobo) || priceKobo <= 0) {
      toast.error('Enter a valid price in Naira')
      return
    }

    setLoading(true)
    try {
      // ── Upload image to Supabase Storage ──
      let imageUrl = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: imgData, error: imgError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })

        if (!imgError && imgData) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)
          imageUrl = publicUrl
        } else {
          console.error('Image upload error:', imgError)
        }
      }

      // ── Get category ID from slug ──
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', form.category_slug)
        .single()

      const categoryEmoji = CATEGORIES.find(c => c.slug === form.category_slug)?.emoji || '🌿'

      // ── FIX 2: Save category_slug, category_emoji, market_day_id, market_id ──
      // ── FIX 3: image_url now properly saved and market_day_id included ──
      const { error } = await supabase.from('products').insert({
        // Market linking — critical for Market.jsx to find this product
        market_day_id: marketDayId,
        market_id: marketId,

        // Category — fixed: now saves slug and emoji
        category_id: catData?.id || null,
        category_slug: form.category_slug,
        category_emoji: categoryEmoji,

        // Product details
        name: form.name,
        description: form.description || null,
        price: priceKobo,
        unit: form.unit,
        quantity_available: parseInt(form.quantity_available),

        // Flags
        is_seasonal: form.is_seasonal,
        is_bulk: form.is_bulk,
        is_preorder_only: form.is_preorder_only,
        is_meat: form.is_meat,
        meat_type: form.is_meat ? (form.meat_type || null) : null,
        season_note: form.season_note || null,

        // Image — now properly linked
        image_url: imageUrl,

        // Agent
        uploaded_by: agent?.id,
        active: true,
      })

      if (error) throw error

      setUploaded(true)
      toast.success(`✅ ${form.name} is now live on the app!`)

      setTimeout(() => {
        setUploaded(false)
        setForm({
          name: '', category_slug: 'vegetables', price: '', unit: 'bunch',
          quantity_available: '', is_seasonal: false, is_bulk: false,
          is_preorder_only: false, is_meat: false, meat_type: '',
          season_note: '', description: '',
        })
        setImageFile(null)
        setImagePreview(null)
      }, 2500)

    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Upload failed: ' + err.message)
    }
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

      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '20px 16px 24px' }}>
        <Link to="/agent" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-muted)', fontSize: 14, marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 24, fontWeight: 700 }}>
          Upload Product
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
          Photo + price = live on the app instantly
        </p>
      </div>

      {/* Market day indicator */}
      <div style={{
        background: loadingMarket ? 'var(--cream-dark)' : marketDayId ? 'rgba(27,67,50,0.08)' : 'rgba(232,93,4,0.08)',
        borderBottom: '1px solid var(--cream-dark)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: loadingMarket ? '#ccc' : marketDayId ? '#22c55e' : 'var(--orange)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: loadingMarket ? '#888' : marketDayId ? 'var(--green)' : 'var(--orange)', fontWeight: 600 }}>
          {loadingMarket
            ? 'Finding active market day...'
            : marketDayId
            ? `Uploading for: ${marketName}`
            : 'No active market day — contact owner to activate one'}
        </span>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── PHOTO SECTION ── FIX 1: Two buttons — camera + gallery ── */}
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, marginBottom: 14 }}>Product Photo</h3>

          {imagePreview ? (
            <div>
              <img src={imagePreview} alt="preview" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                style={{ background: 'none', color: '#888', fontSize: 13, textDecoration: 'underline', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Remove photo
              </button>
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--green-muted)', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
              <Camera size={32} color="var(--green-muted)" style={{ margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontWeight: 600, color: 'var(--charcoal)', marginBottom: 4, fontSize: 14 }}>
                Add a product photo
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
                Choose from gallery or take a new photo
              </div>

              {/* Two separate buttons — gallery and camera */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>

                {/* Gallery button — no capture attribute */}
                <label htmlFor="img-gallery" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--green)', color: 'white',
                  padding: '10px 16px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Image size={16} />
                  Gallery
                </label>
                <input
                  id="img-gallery"
                  type="file"
                  accept="image/*"
                  onChange={handleImageGallery}
                  style={{ display: 'none' }}
                />

                {/* Camera button — with capture */}
                <label htmlFor="img-camera" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(27,67,50,0.1)', color: 'var(--green)',
                  border: '1.5px solid var(--green-muted)',
                  padding: '10px 16px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Camera size={16} />
                  Camera
                </label>
                <input
                  id="img-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCamera}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── PRODUCT DETAILS ── */}
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, marginBottom: 16 }}>Product Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Category — FIX 2: now properly saved */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Category *</label>
              <select name="category_slug" value={form.category_slug} onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            {/* Meat type — shows when category is meat */}
            {form.is_meat && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Meat Type *</label>
                <select name="meat_type" value={form.meat_type} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  <option value="">Select...</option>
                  <option value="chicken">🐔 Chicken</option>
                  <option value="goat">🐐 Goat</option>
                </select>
              </div>
            )}

            {/* Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Product Name *</label>
              <input name="name" placeholder="e.g. Fresh Ugu Leaves" value={form.name} onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Price + Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Price (₦) *</label>
                <input name="price" type="number" placeholder="e.g. 800" value={form.price} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 16, outline: 'none', fontFamily: 'DM Mono, monospace', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Unit *</label>
                <select name="unit" value={form.unit} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Quantity Available *</label>
              <input name="quantity_available" type="number" placeholder="How many do you have?" value={form.quantity_available} onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>💡 List fewer than actual — always keep a buffer</div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Description (optional)</label>
              <textarea name="description" placeholder="e.g. Leaves stripped from stalk, very fresh" value={form.description} onChange={handleChange}
                rows={2} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
          </div>
        </div>

        {/* ── FLAGS ── */}
        <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, marginBottom: 14 }}>Product Flags</h3>
          {[
            { name: 'is_seasonal', label: '⭐ Seasonal item', desc: 'Currently in season — show season badge' },
            { name: 'is_bulk', label: '📦 Bulk item', desc: 'Heavy/large — applies bulk delivery rate' },
            { name: 'is_preorder_only', label: '🌅 Pre-order only', desc: 'Not available for same-day orders (e.g. dressed chicken)' },
          ].map(({ name, label, desc }) => (
            <label key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" name={name} checked={form[name]} onChange={handleChange}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--green)', flexShrink: 0 }} />
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
                style={{ width: '100%', padding: '11px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !marketDayId}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 17, opacity: (loading || !marketDayId) ? 0.7 : 1 }}
        >
          <Upload size={20} />
          {loading ? 'Uploading...' : 'List Product Now'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12 }}>
          Product appears live on the buyer app immediately after upload
        </p>
      </div>
    </div>
  )
}
