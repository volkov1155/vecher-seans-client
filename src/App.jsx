import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://vecher-seans-backend-production.up.railway.app'

// ─── API helper ────────────────────────────────────────────────────────────────
async function apiFetch(method, path, body = null, token = null) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || data.error || `Ошибка ${res.status}`)
  return data
}

// ─── Color helpers ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#7c6af7', '#f76c6c', '#6cf7c8', '#f7c86c', '#6cb4f7', '#f06cf7']
function getAvatarColor(str = '') {
  let h = 0
  for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#0d0d15',
  card: '#16162a',
  cardHover: '#1c1c32',
  input: '#1e1e35',
  border: '#2a2a45',
  accent: '#7c6af7',
  text: '#ffffff',
  sub: '#9090b0',
  danger: '#f76c6c',
  success: '#6cf7c8',
  star: '#f5c518',
}

// ─── Style factories ───────────────────────────────────────────────────────────
const mkBtn = (variant = 'primary', extra = {}) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '10px 20px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  transition: 'opacity 0.2s, transform 0.15s',
  ...(variant === 'primary'
    ? { background: C.accent, color: '#fff' }
    : variant === 'ghost'
    ? { background: 'transparent', color: C.sub, border: `1px solid ${C.border}` }
    : variant === 'danger'
    ? { background: C.danger, color: '#fff' }
    : {}),
  ...extra,
})

const mkInput = (extra = {}) => ({
  width: '100%',
  padding: '12px 16px',
  background: C.input,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text,
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  ...extra,
})

// ─── Shared UI components ──────────────────────────────────────────────────────
function FocusInput({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 6, color: C.sub, fontSize: 13, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        style={mkInput({ borderColor: focused ? C.accent : C.border })}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </div>
  )
}

function AlertBox({ msg, type = 'error' }) {
  if (!msg) return null
  const isErr = type === 'error'
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: isErr ? 'rgba(247,108,108,0.12)' : 'rgba(108,247,200,0.12)',
        border: `1px solid ${isErr ? C.danger : C.success}`,
        color: isErr ? C.danger : C.success,
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      {msg}
    </div>
  )
}

function ToggleButton({ value, current, onSelect, children }) {
  const active = value === current
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      style={{
        flex: 1,
        padding: '10px 8px',
        borderRadius: 10,
        border: `2px solid ${active ? C.accent : C.border}`,
        background: active ? 'rgba(124,106,247,0.15)' : C.input,
        color: active ? C.text : C.sub,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch('POST', '/api/auth/login', { email, password })
      onLogin(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🎬</div>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
            Вечерний сеанс
          </h1>
          <p style={{ color: C.sub, marginTop: 8, fontSize: 15 }}>Семейная кинотека</p>
        </div>

        <div style={{ background: C.card, borderRadius: 18, padding: 32, border: `1px solid ${C.border}` }}>
          <h2 style={{ color: C.text, marginBottom: 24, fontSize: 20, fontWeight: 700 }}>Вход</h2>
          <AlertBox msg={error} />
          <form onSubmit={handleSubmit}>
            <FocusInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <FocusInput
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="submit"
              disabled={loading}
              style={mkBtn('primary', { width: '100%', padding: 14, fontSize: 15, marginTop: 4 })}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 22, color: C.sub, fontSize: 14 }}>
            Нет аккаунта?{' '}
            <button
              onClick={onGoRegister}
              style={{
                background: 'none',
                border: 'none',
                color: C.accent,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
                padding: 0,
              }}
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Register Screen ───────────────────────────────────────────────────────────
const AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👦', '🧓', '👴', '👵', '🦸', '🧙', '🧚']

function RegisterScreen({ onRegister, onGoLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState('🧑')
  const [familyAction, setFamilyAction] = useState('create')
  const [familyName, setFamilyName] = useState('')
  const [familyCode, setFamilyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (familyAction === 'join' && familyCode.replace(/\s/g, '').length < 6) {
      setError('Код семьи должен содержать 6 символов')
      return
    }
    setLoading(true)
    try {
      const body = { name, email, password, avatar, familyAction }
      if (familyAction === 'create') body.familyName = familyName
      else body.familyCode = familyCode.toUpperCase().trim()
      const data = await apiFetch('POST', '/api/auth/register', body)
      onRegister(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎬</div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 800 }}>Вечерний сеанс</h1>
        </div>

        <div style={{ background: C.card, borderRadius: 18, padding: 32, border: `1px solid ${C.border}` }}>
          <h2 style={{ color: C.text, marginBottom: 24, fontSize: 20, fontWeight: 700 }}>Регистрация</h2>
          <AlertBox msg={error} />
          <form onSubmit={handleSubmit}>
            {/* Avatar picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: C.sub, fontSize: 13, fontWeight: 500 }}>
                Аватар
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      border: `2px solid ${avatar === av ? C.accent : C.border}`,
                      background: avatar === av ? 'rgba(124,106,247,0.18)' : C.input,
                      fontSize: 22,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <FocusInput
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              required
            />
            <FocusInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <FocusInput
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              minLength={6}
              required
            />

            {/* Family action */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: C.sub, fontSize: 13, fontWeight: 500 }}>
                Семья
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <ToggleButton value="create" current={familyAction} onSelect={setFamilyAction}>
                  ✨ Создать семью
                </ToggleButton>
                <ToggleButton value="join" current={familyAction} onSelect={setFamilyAction}>
                  🔗 Войти в семью
                </ToggleButton>
              </div>
            </div>

            {familyAction === 'create' ? (
              <FocusInput
                label="Название семьи"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Семья Ивановых"
                required
              />
            ) : (
              <FocusInput
                label="Код семьи (6 символов)"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              style={mkBtn('primary', { width: '100%', padding: 14, fontSize: 15, marginTop: 4 })}
            >
              {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 22, color: C.sub, fontSize: 14 }}>
            Уже есть аккаунт?{' '}
            <button
              onClick={onGoLogin}
              style={{
                background: 'none',
                border: 'none',
                color: C.accent,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
                padding: 0,
              }}
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Movie Card (family list) ──────────────────────────────────────────────────
function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false)
  const watchers = movie.watchlist || []
  const wantList = watchers.filter((w) => w.status === 'WANT')
  const watchedList = watchers.filter((w) => w.status === 'WATCHED')

  return (
    <div
      onClick={() => onClick && onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.cardHover : C.card,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered
          ? '0 12px 40px rgba(124,106,247,0.22)'
          : '0 2px 10px rgba(0,0,0,0.35)',
        border: `1px solid ${hovered ? C.accent + '55' : C.border}`,
      }}
    >
      {/* Poster */}
      <div
        style={{
          position: 'relative',
          paddingTop: '148%',
          background: '#10101e',
          overflow: 'hidden',
        }}
      >
        {(movie.poster || movie.Poster) && (movie.poster || movie.Poster) !== 'N/A' ? (
          <img
            src={movie.poster || movie.Poster}
            alt={movie.title || movie.Title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 52,
              color: C.sub,
            }}
          >
            🎬
          </div>
        )}
        {movie.imdbRating && movie.imdbRating !== 'N/A' && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(6px)',
              borderRadius: 7,
              padding: '3px 8px',
              fontSize: 12,
              fontWeight: 700,
              color: C.star,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            ⭐ {movie.imdbRating}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px' }}>
        <div
          style={{
            fontWeight: 600,
            color: C.text,
            fontSize: 13,
            marginBottom: 5,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {movie.title}
        </div>
        <div
          style={{
            color: C.sub,
            fontSize: 11,
            marginBottom: 10,
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {movie.year && <span>{movie.year}</span>}
          {movie.genre && (
            <>
              <span style={{ opacity: 0.4 }}>·</span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 100,
                }}
              >
                {movie.genre.split(',')[0].trim()}
              </span>
            </>
          )}
        </div>

        {/* Watcher circles */}
        {watchers.length > 0 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            {watchers.slice(0, 5).map((w, i) => (
              <div
                key={i}
                title={`${w.user?.name || 'Участник'} — ${
                  w.status === 'WANT' ? 'хочет посмотреть' : 'просмотрено'
                }`}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: getAvatarColor(w.user?.name || String(i)),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  border: `2px solid ${C.card}`,
                  flexShrink: 0,
                  marginLeft: i > 0 ? -6 : 0,
                }}
              >
                {w.user?.avatar || w.user?.name?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
            {wantList.length > 0 && (
              <span style={{ fontSize: 10, color: C.sub, marginLeft: 4 }}>
                {wantList.length} хотят
              </span>
            )}
            {watchedList.length > 0 && (
              <span style={{ fontSize: 10, color: C.success, marginLeft: 2 }}>
                {watchedList.length} видели
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Movie Detail Modal ────────────────────────────────────────────────────────
function MovieDetailModal({ movie, token, onClose, onAdded, onDelete, initialStatus }) {
  const [status, setStatus] = useState(initialStatus || 'WANT')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!movie) return null

  const title = movie.Title || movie.title || ''
  const year = movie.Year || movie.year || ''
  const runtime = movie.Runtime || movie.runtime || ''
  const genre = movie.Genre || movie.genre || ''
  const plot = movie.Plot || movie.plot || ''
  const director = movie.Director || movie.director || ''
  const actors = movie.Actors || movie.actors || ''
  const imdbRating = movie.imdbRating || movie.rating || ''
  const poster = movie.Poster || movie.poster || ''
  const imdbId = movie.imdbID || movie.imdbId || ''

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      // Try common DELETE patterns until one works
      let deleted = false
      const attempts = [
        () => apiFetch('DELETE', `/api/movies/watchlist/${imdbId}`, null, token),
        () => apiFetch('DELETE', `/api/movies/watchlist`, { imdbId }, token),
        () => apiFetch('DELETE', `/api/watchlist/${imdbId}`, null, token),
        () => apiFetch('DELETE', `/api/watchlist`, { imdbId }, token),
      ]
      for (const attempt of attempts) {
        try {
          await attempt()
          deleted = true
          break
        } catch (e) {
          if (!e.message.includes('404') && !e.message.includes('405')) throw e
        }
      }
      if (!deleted) throw new Error('Endpoint удаления не найден на сервере')
      if (onDelete) onDelete()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleAdd() {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await apiFetch('POST', '/api/movies/watchlist', {
        imdbId,
        status,
        title,
        poster,
        year,
        genre,
        plot,
        director,
        actors,
        imdbRating,
        runtime,
      }, token)
      if (onDelete) {
        onDelete()
        onClose()
      } else {
        setSuccess('Добавлено в список!')
        if (onAdded) onAdded()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 20,
          maxWidth: 540,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: `1px solid ${C.border}`,
          boxShadow: '0 30px 90px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header area */}
        <div style={{ display: 'flex', gap: 20, padding: 24 }}>
          {/* Poster */}
          <div
            style={{
              flexShrink: 0,
              width: 130,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#10101e',
              aspectRatio: '2/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {poster && poster !== 'N/A' ? (
              <img
                src={poster}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: 44 }}>🎬</span>
            )}
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
              {title}
            </h2>
            <div
              style={{
                color: C.sub,
                fontSize: 13,
                marginBottom: 10,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {year && <span>📅 {year}</span>}
              {runtime && <span>⏱ {runtime}</span>}
              {imdbRating && imdbRating !== 'N/A' && (
                <span style={{ color: C.star, fontWeight: 700 }}>⭐ {imdbRating}</span>
              )}
            </div>

            {genre && (
              <div style={{ marginBottom: 12 }}>
                {genre.split(',').map((g) => (
                  <span
                    key={g}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(124,106,247,0.15)',
                      color: C.accent,
                      borderRadius: 6,
                      padding: '2px 9px',
                      fontSize: 12,
                      marginRight: 5,
                      marginBottom: 4,
                    }}
                  >
                    {g.trim()}
                  </span>
                ))}
              </div>
            )}

            {plot && (
              <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>
                {plot}
              </p>
            )}

            {director && (
              <div style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>
                🎬 <span style={{ color: C.text }}>{director}</span>
              </div>
            )}
            {actors && (
              <div style={{ color: C.sub, fontSize: 12 }}>
                👥 <span style={{ color: C.text }}>{actors}</span>
              </div>
            )}
          </div>
        </div>

        {/* Add to list */}
        <div
          style={{
            padding: '4px 24px 24px',
            borderTop: `1px solid ${C.border}`,
            marginTop: 4,
          }}
        >
          <AlertBox msg={error} />
          <AlertBox msg={success} type="success" />
          {onDelete ? (
            <>
              <p style={{ color: C.sub, fontSize: 13, margin: '16px 0 10px', fontWeight: 500 }}>
                Статус фильма:
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <ToggleButton value="WANT" current={status} onSelect={setStatus}>
                  🎯 Хочу посмотреть
                </ToggleButton>
                <ToggleButton value="WATCHED" current={status} onSelect={setStatus}>
                  ✅ Уже смотрел
                </ToggleButton>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleAdd}
                  disabled={loading || !!success}
                  style={mkBtn('primary', { flex: 1, padding: 13 })}
                >
                  {loading ? 'Сохраняем...' : '💾 Сохранить'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={mkBtn('danger', { padding: 13 })}
                >
                  {deleting ? '...' : '🗑'}
                </button>
                <button onClick={onClose} style={mkBtn('ghost', { padding: '13px 16px' })}>
                  ✕
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: C.sub, fontSize: 13, margin: '16px 0 10px', fontWeight: 500 }}>
                Добавить в мой список:
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <ToggleButton value="WANT" current={status} onSelect={setStatus}>
                  🎯 Хочу посмотреть
                </ToggleButton>
                <ToggleButton value="WATCHED" current={status} onSelect={setStatus}>
                  ✅ Уже смотрел
                </ToggleButton>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleAdd}
                  disabled={loading || !!success}
                  style={mkBtn('primary', { flex: 1, padding: 13 })}
                >
                  {loading ? 'Добавляем...' : '+ Добавить в мой список'}
                </button>
                <button onClick={onClose} style={mkBtn('ghost', { padding: '13px 16px' })}>
                  ✕
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Search Screen ─────────────────────────────────────────────────────────────
function SearchScreen({ token, onBack }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    try {
      const data = await apiFetch(
        'GET',
        `/api/movies/search?q=${encodeURIComponent(query.trim())}`,
        null,
        token,
      )
      setResults(data.results || data.movies || data.Search || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      {/* Header */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: C.sub,
            cursor: 'pointer',
            fontSize: 22,
            padding: '4px 6px',
            borderRadius: 8,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск фильмов..."
            style={mkInput({ flex: 1 })}
          />
          <button
            type="submit"
            disabled={loading}
            style={mkBtn('primary', { padding: '10px 16px', flexShrink: 0 })}
          >
            {loading ? '...' : '🔍 Найти'}
          </button>
        </form>
      </div>

      <div style={{ padding: 20 }}>
        <AlertBox msg={error} />

        {!query && !results.length && (
          <div style={{ textAlign: 'center', color: C.sub, marginTop: 80, padding: 20 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16, marginBottom: 6 }}>Введите название фильма</p>
            <p style={{ fontSize: 13 }}>Поиск работает через OMDB</p>
          </div>
        )}

        {!loading && query && results.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: C.sub, marginTop: 60, fontSize: 16 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎬</div>
            По запросу «{query}» ничего не найдено
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', color: C.sub, marginTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>Ищем...
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 14,
          }}
        >
          {results.map((movie) => {
            const poster = movie.Poster || movie.poster || ''
            const title = movie.Title || movie.title || ''
            const year = movie.Year || movie.year || ''
            const id = movie.imdbID || movie.id || Math.random()
            return (
              <div
                key={id}
                onClick={() => setSelected(movie)}
                style={{
                  background: C.card,
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `1px solid ${C.border}`,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = C.accent
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,106,247,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.borderColor = C.border
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div
                  style={{
                    paddingTop: '148%',
                    position: 'relative',
                    background: '#10101e',
                  }}
                >
                  {poster && poster !== 'N/A' ? (
                    <img
                      src={poster}
                      alt={title}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 44,
                      }}
                    >
                      🎬
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 10px 12px' }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: C.text,
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {title}
                  </div>
                  {year && <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>{year}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <MovieDetailModal
          movie={selected}
          token={token}
          onClose={() => setSelected(null)}
          onAdded={() => {}}
        />
      )}
    </div>
  )
}

// ─── Home Screen ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: '🎬 Все фильмы' },
  { id: 'want', label: '❤️ Хотят все' },
  { id: 'watched', label: '✅ Просмотрено' },
]

function HomeScreen({ user, token, onLogout, onSearch }) {
  const [tab, setTab] = useState('all')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [family, setFamily] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)

  const loadMovies = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'want') {
        const data = await apiFetch('GET', '/api/movies/intersections', null, token)
        setMovies(data.movies || data || [])
      } else {
        const data = await apiFetch('GET', '/api/movies/family', null, token)
        const all = data.movies || data || []
        if (tab === 'watched') {
          setMovies(all.filter((m) => m.watchlist?.some((w) => w.status === 'WATCHED')))
        } else {
          setMovies(all)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tab, token])

  useEffect(() => {
    loadMovies()
  }, [loadMovies])

  useEffect(() => {
    apiFetch('GET', '/api/family', null, token)
      .then((d) => setFamily(d.family || d))
      .catch(() => {})
  }, [token])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      {/* Top bar */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🎬</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.text, letterSpacing: -0.3 }}>
              Вечерний сеанс
            </div>
            {family && (
              <div style={{ fontSize: 11, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {family.name}
                {family.code && (
                  <span
                    style={{
                      marginLeft: 8,
                      background: C.input,
                      border: `1px solid ${C.border}`,
                      borderRadius: 5,
                      padding: '1px 6px',
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                    }}
                  >
                    {family.code}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onSearch}
          style={mkBtn('ghost', { padding: '8px 14px', fontSize: 13 })}
        >
          🔍 Найти
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: getAvatarColor(user?.name || ''),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              border: `2px solid ${C.accent}`,
              flexShrink: 0,
            }}
            title={user?.name}
          >
            {user?.avatar || user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              color: C.sub,
              cursor: 'pointer',
              fontSize: 12,
              padding: '4px 6px',
              borderRadius: 6,
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: '0 16px',
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
        }}
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${tab === id ? C.accent : 'transparent'}`,
              color: tab === id ? C.text : C.sub,
              cursor: 'pointer',
              padding: '16px 18px',
              fontSize: 14,
              fontWeight: tab === id ? 700 : 400,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Movie grid */}
      <div style={{ padding: '20px 20px 100px' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: C.sub, marginTop: 80 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎬</div>
            <p style={{ fontSize: 15 }}>Загружаем...</p>
          </div>
        )}

        <AlertBox msg={error} />

        {!loading && movies.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: C.sub, marginTop: 80, padding: '0 20px' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🍿</div>
            <p style={{ fontSize: 16, marginBottom: 6, color: C.text }}>
              {tab === 'all'
                ? 'Список пуст — добавьте первый фильм!'
                : tab === 'want'
                ? 'Нет фильмов, которые хотят посмотреть все'
                : 'Нет просмотренных фильмов'}
            </p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              {tab === 'all' ? 'Найдите фильм и добавьте его в список' : ''}
            </p>
            {tab === 'all' && (
              <button onClick={onSearch} style={mkBtn('primary')}>
                🔍 Найти фильм
              </button>
            )}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
            gap: 16,
          }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id || movie.imdbId}
              movie={movie}
              onClick={setSelectedMovie}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onSearch}
        title="Добавить фильм"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 24,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.accent}, #5a48e8)`,
          border: 'none',
          color: '#fff',
          fontSize: 30,
          cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(124,106,247,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.12)'
          e.currentTarget.style.boxShadow = '0 10px 32px rgba(124,106,247,0.7)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,106,247,0.55)'
        }}
      >
        +
      </button>

      {/* Movie detail modal (for family list items) */}
      {selectedMovie && (
        <MovieDetailModal
          movie={{
            ...selectedMovie,
            Poster: selectedMovie.poster,
            Title: selectedMovie.title,
            Year: selectedMovie.year,
            Genre: selectedMovie.genre,
            Plot: selectedMovie.plot,
            Director: selectedMovie.director,
            Actors: selectedMovie.actors,
            imdbRating: selectedMovie.imdbRating,
          }}
          token={token}
          onClose={() => setSelectedMovie(null)}
          onAdded={loadMovies}
          onDelete={loadMovies}
          initialStatus={
            selectedMovie.watchlist?.find((w) => w.user?.id === user?.id)?.status || 'WANT'
          }
        />
      )}
    </div>
  )
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [screen, setScreen] = useState(() =>
    localStorage.getItem('token') ? 'loading' : 'login',
  )

  useEffect(() => {
    if (token && screen === 'loading') {
      apiFetch('GET', '/api/auth/me', null, token)
        .then((data) => {
          setUser(data.user || data)
          setScreen('home')
        })
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
          setScreen('login')
        })
    }
  }, [token, screen])

  function handleLogin(newToken, userData) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    setScreen('home')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setScreen('login')
  }

  if (screen === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: C.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: C.sub,
        }}
      >
        <div style={{ fontSize: 72 }}>🎬</div>
        <p style={{ fontSize: 16 }}>Загружаем...</p>
      </div>
    )
  }

  if (screen === 'login')
    return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen('register')} />

  if (screen === 'register')
    return <RegisterScreen onRegister={handleLogin} onGoLogin={() => setScreen('login')} />

  if (screen === 'search')
    return <SearchScreen token={token} user={user} onBack={() => setScreen('home')} />

  return (
    <HomeScreen
      user={user}
      token={token}
      onLogout={handleLogout}
      onSearch={() => setScreen('search')}
    />
  )
}
