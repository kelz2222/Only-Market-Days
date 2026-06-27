import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Upload, CheckCircle } from 'lucide-react'
import { useAgent } from './AgentApp'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { slug: 'vegetables', name: '🌿 Leafy Vegetables', hint: 'Ugu, Ukazi, Uziza' },
  { slug: 'staples', name: '🌾 Staples & Swallow', hint: 'Yam, Garri, Akpu, Fufu' },
  { slug: 'palm', name: '🫙 Palm Produce', hint: 'Palm oil, Palm fruit' },
  { slug: 'protein', name: '🦐 Dried Protein', hint: 'Stockfish, Crayfish' },
  { slug: 'meat', name: '🐔 Dressed Meat', hint: 'Chicken, Goat — processed fresh' },
  { slug: 'spices', name: '🌶️ Spices & Condiments', hint: 'Fresh pepper, Onion' },
  { slug: 'fruits', name: '🍌 Fruits & Plantain', hint: 'Plantain, Banana' },
  { slug: 'seasonal', name: '🍊 Seasonal Fruits', hint: 'Ube, Mango, Udara, Orange' },
  { slug: 'nuts', name: '🌰 Nuts & Kola', hint: 'Bitterkola, Kolanut' },
  { slug: 'grains', name: '🌽 Grains & Corn', hint: 'Fresh corn, Dried corn' },
]

const UNITS = [
  'bunch', 'kg', 'keg', 'bag', 'piece',
  'dozen', 'mudu', 'wrap', 'tuber', 'half', 'litre',
]

export default function AgentUpload() {
  const { agent } = useAgent()
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [form, setForm] = useState({
    name: '',
    category_slug: '',
    price: '',
    unit: 'bunch',
    quantity_available: '',
    is_seasonal: false,
    is_bulk: false,
    is_preorder_only: false,
    season_note: '',
    description: '',
  })

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

  // Auto-set smart defaults when category changes
  function handleCategoryChange(e) {
    const slug = e.target.value
    setForm(prev => ({
      ...prev,
      category_slug: slug,
      // Auto-set preorder only for meat
      is_preorder_only: slug === 'meat' ? true : prev.is_preorder_only,
      // Auto-set bulk for palm
      is_bulk: slug === 'palm' ? true : prev.is_bulk,
      // Auto-set unit based on category
      unit: slug === 'palm' ? 'keg'
        : slug === 'protein' ? 'kg'
        : slug === 'staples' ? 'tuber'
        : slug === 'meat' ? 'piece'
        : slug === 'grains' ? 'dozen'
        : 'bunch',
    }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error('Enter the product name')
      return
    }
    if (!form.category_slug) {
      toast.error('Please select a category')
      return
    }
    if (!form.price) {
      toast.error('Enter the price')
      return
    }
    if (!form.quantity_available) {
      toast.error('Enter the quantity available')
      return
    }

    const priceKobo = Math.round(parseFloat(form.price) * 100)
    if (isNaN(priceKobo) || priceKobo <= 0) {
      toast.error('Enter a valid price in Naira')
      return
    }

    setLoading(true)

    try {
      let imageUrl = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `products/${Date.now()}.${ext}`
        const { data: imgData, error: imgError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (!imgError && imgData) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }

      // Get category ID from slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', form.category_slug)
        .single()

      // Get agent's market ID
      const marketId = agent?.market_id || null

      // Get market name for display
      let marketName = 'Orie Ntigha'
      if (marketId) {
        const { data: marketData } = await supabase
          .from('markets')
          .select('name')
          .eq('id', marketId)
          .single()
        if (marketData) marketName = marketData.name
      }

      const { error } = await supabase.from('products').insert({
        name: form.name.trim(),
        price: priceKobo,
        unit: form.unit,
        quantity_available: parseInt(form.quantity_available),
        quantity_sold: 0,
        is_seasonal: form.is_seasonal,
        is_bulk: form.is_bulk,
        is_preorder_only: form.is_preorder_only,
        season_note: form.season_note || null,
        description: form.description || null,
        image_url: imageUrl,
        uploaded_by: agent?.id || null,
        category_id: categoryData?.id || null,
        market_id: marketId,
        market_name: marketName,
        active: true,
      })

      if (error) throw error

      setUploaded(true)
      toast.success(`${form.name} is now live on the market!`)

      setTimeout(() => {
        setUploaded(false)
        setForm({
          name: '',
          category_slug: '',
          price: '',
          unit: 'bunch',
          quantity_available: '',
          is_seasonal: false,
          is_bulk: false,
          is_preorder_only: false,
          season_note: '',
          description: '',
        })
        setImageFile(null)
        setImagePreview(null)
      }, 2500)

    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Upload failed. Try again.')
    }

    setLoading(false)
  }

  if (uploaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <CheckCircle size={72} color="var(--green-muted)" />
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          color: 'white', fontSize: 28,
        }}>
          Product Listed!
        </h2>
        <p style={{ color: 'var(--green-muted)', fontSize: 15 }}>
          Buyers can now see it on the app
        </p>
      </div>
    )
  }

  const selectedCategory = CATEGORIES.find(c => c.slug === form.category_slug)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '20px 16px 24px' }}>
        <Link to="/agent" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--green-muted)', fontSize: 14, marginBottom: 16,
          textDecoration: 'none',
        }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          color: 'white', fontSize: 24, fontWeight: 700,
        }}>
          Upload Product
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
          Take a photo, set the price, go live immediately
        </p>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* Photo upload */}
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 17, marginBottom: 14,
          }}>
            Product Photo
          </h3>
          <label htmlFor="img-upload" style={{
            display: 'block',
            border: '2px dashed var(--green-muted)',
            borderRadius: 12, padding: '24px',
            textAlign: 'center', cursor: 'pointer',
            overflow: 'hidden',
            background: imagePreview ? 'transparent' : 'rgba(27,67,50,0.03)',
          }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  width: '100%', height: 200,
                  objectFit: 'cover', borderRadius: 8,
                }}
              />
            ) : (
              <div>
                <Camera size={32} color="var(--green-muted)"
                  style={{ margin: '0 auto 10px' }}
                />
                <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>
                  Take or upload photo
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  Tap to use your camera or gallery
                </div>
              </div>
            )}
          </label>
          <input
  id="img-upload"
  type="file"
  accept="image/*"
  onChange={handleImage}
  style={{ display: 'none' }}
/>
          {imagePreview && (
            <button
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              style={{
                marginTop: 10, background: 'none',
                border: 'none', color: '#888', fontSize: 13,
                textDecoration: 'underline', display: 'block',
                cursor: 'pointer',
              }}
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Product details */}
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 17, marginBottom: 16,
          }}>
            Product Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Product name */}
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, color: '#666',
                display: 'block', marginBottom: 6,
              }}>
                Product Name *
              </label>
              <input
                name="name"
                placeholder="e.g. Fresh Ugu Leaves"
                value={form.name}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  border: '1.5px solid var(--cream-dark)',
                  fontSize: 15, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Category — most important field */}
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, color: '#666',
                display: 'block', marginBottom: 6,
              }}>
                Category * <span style={{ color: 'var(--orange)', fontWeight: 400 }}>— choose carefully</span>
              </label>
              <select
                name="category_slug"
                value={form.category_slug}
                onChange={handleCategoryChange}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  border: `1.5px solid ${!form.category_slug ? 'var(--orange)' : 'var(--cream-dark)'}`,
                  fontSize: 14, outline: 'none', background: 'white',
                  color: form.category_slug ? 'var(--charcoal)' : '#aaa',
                  boxSizing: 'border-box',
                }}
              >
                <option value="" disabled>Select a category...</option>
                {CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Show hint for selected category */}
              {selectedCategory && (
                <div style={{
                  marginTop: 6, fontSize: 12, color: 'var(--green)',
                  background: 'rgba(27,67,50,0.06)',
                  borderRadius: 6, padding: '6px 10px',
                }}>
                  Examples: {selectedCategory.hint}
                </div>
              )}

              {/* Warning if name says chicken/goat but category is not meat */}
              {form.name && form.category_slug && form.category_slug !== 'meat' &&
                (form.name.toLowerCase().includes('chicken') ||
                 form.name.toLowerCase().includes('goat') ||
                 form.name.toLowerCase().includes('meat')) && (
                <div style={{
                  marginTop: 6, fontSize: 12, color: 'var(--orange)',
                  background: 'rgba(232,93,4,0.08)',
                  borderRadius: 6, padding: '6px 10px',
                  fontWeight: 600,
                }}>
                  ⚠️ This looks like a meat product. Please select "Dressed Meat" as the category.
                </div>
              )}
            </div>

            {/* Price and unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{
                  fontSize: 12, fontWeight: 600, color: '#666',
                  display: 'block', marginBottom: 6,
                }}>
                  Price (₦) *
                </label>
                <input
                  name="price"
                  type="number"
                  placeholder="e.g. 800"
                  value={form.price}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 8,
                    border: '1.5px solid var(--cream-dark)',
                    fontSize: 16, outline: 'none',
                    fontFamily: 'DM Mono, monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: 12, fontWeight: 600, color: '#666',
                  display: 'block', marginBottom: 6,
                }}>
                  Unit *
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 8,
                    border: '1.5px solid var(--cream-dark)',
                    fontSize: 14, outline: 'none', background: 'white',
                    boxSizing: 'border-box',
                  }}
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, color: '#666',
                display: 'block', marginBottom: 6,
              }}>
                Quantity Available *
              </label>
              <input
                name="quantity_available"
                type="number"
                placeholder="How many do you have?"
                value={form.quantity_available}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  border: '1.5px solid var(--cream-dark)',
                  fontSize: 15, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                💡 List fewer than actual stock — always keep a small buffer
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, color: '#666',
                display: 'block', marginBottom: 6,
              }}>
                Description (optional)
              </label>
              <textarea
                name="description"
                placeholder="e.g. Leaves already stripped from stalk, very fresh"
                value={form.description}
                onChange={handleChange}
                rows={2}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  border: '1.5px solid var(--cream-dark)',
                  fontSize: 14, outline: 'none', resize: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 17, marginBottom: 6,
          }}>
            Product Flags
          </h3>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>
            These are set automatically based on category but you can adjust them.
          </p>

          {[
            {
              name: 'is_seasonal',
              label: '⭐ Seasonal item',
              desc: 'Currently in season — shows a season badge on the product',
            },
            {
              name: 'is_bulk',
              label: '📦 Bulk / heavy item',
              desc: 'Large or heavy item — applies bulk delivery rate (e.g. palm oil keg, rice bag)',
            },
            {
              name: 'is_preorder_only',
              label: '🌅 Pre-order only',
              desc: 'Cannot be ordered same-day (e.g. dressed chicken, dressed goat)',
            },
          ].map(({ name, label, desc }) => (
            <label key={name} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              marginBottom: 14, cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                name={name}
                checked={form[name]}
                onChange={handleChange}
                style={{
                  width: 18, height: 18, marginTop: 2,
                  accentColor: 'var(--green)', flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{desc}</div>
              </div>
            </label>
          ))}

          {form.is_seasonal && (
            <div style={{ marginTop: 4 }}>
              <label style={{
                fontSize: 12, fontWeight: 600, color: '#666',
                display: 'block', marginBottom: 6,
              }}>
                Season Note
              </label>
              <input
                name="season_note"
                placeholder="e.g. Peak season — cheapest it will be all year"
                value={form.season_note}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8,
                  border: '1.5px solid var(--cream-dark)',
                  fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        {/* Summary preview before submit */}
        {form.name && form.category_slug && form.price && (
          <div style={{
            background: 'rgba(27,67,50,0.06)',
            border: '1px solid var(--green-muted)',
            borderRadius: 12, padding: '14px 16px',
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--green)', marginBottom: 8,
            }}>
              Preview before listing
            </div>
            <div style={{ fontSize: 14, color: 'var(--charcoal)' }}>
              <strong>{form.name}</strong> — {selectedCategory?.name}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
              ₦{parseFloat(form.price || 0).toLocaleString()} per {form.unit}
              {form.quantity_available && ` · ${form.quantity_available} available`}
            </div>
            {form.is_preorder_only && (
              <div style={{ fontSize: 12, color: 'var(--orange)', marginTop: 4 }}>
                Pre-order only
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
          style={{
            width: '100%', justifyContent: 'center',
            padding: '18px', fontSize: 17,
            opacity: loading ? 0.7 : 1,
          }}
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
