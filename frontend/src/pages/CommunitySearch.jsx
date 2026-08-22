import { useState, useEffect, useCallback } from 'react';
import { communityApi, uploadsApi } from '../api';
import { useAuth } from '../context/AuthContext';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

function TimeAgo({ dateStr }) {
  if (!dateStr) return null;
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const label = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : hours < 24 ? `${hours}h ago` : `${days}d ago`;
  return <span>{label}</span>;
}

/* ── Create Post Modal ──────────────────────────────────────────── */
function CreatePostModal({ onClose, onCreated }) {
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [location, setLocation] = useState('');
  const [tags,     setTags]     = useState('');
  const [files,    setFiles]    = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (idx) => {
    setFiles(f => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setError('');
    setSaving(true);
    try {
      // Upload images first
      const imageUrls = [];
      for (const file of files) {
        const res = await uploadsApi.postImage(file);
        imageUrls.push(res.url);
      }

      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const post = await communityApi.createPost({
        title:      title.trim(),
        content:    content.trim() || undefined,
        location:   location.trim() || undefined,
        tags:       tagList,
        image_urls: imageUrls,
      });
      onCreated(post);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-muted shrink-0">
          <h3 className="text-lg font-semibold text-on-surface">Share Your Journey</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>{error}
              </p>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">
                Title <span className="text-error">*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. A week in Kyoto — what I loved"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Location</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">location_on</span>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Kyoto, Japan"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Post Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your experience, tips, or itinerary highlights..."
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary resize-none transition-colors"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Tags</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">tag</span>
                <input
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="japan, culture, budget  (comma separated)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">Separate multiple tags with commas.</p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Photos</label>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-surface-muted group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed border-surface-muted hover:border-primary hover:bg-surface-muted/30 transition-colors cursor-pointer text-sm font-semibold text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                {previews.length > 0 ? 'Add more photos' : 'Upload photos'}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 pt-0 border-t border-surface-muted mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              {saving ? 'Publishing…' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Post Card ──────────────────────────────────────────────────── */
function PostCard({ post, onLike, onSave }) {
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    await onLike(post);
    setLiking(false);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await onSave(post);
    setSaving(false);
  };

  const authorInitials = post.author
    ? `${post.author.first_name?.[0] || ''}${post.author.last_name?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <article className="bg-surface-pure rounded-xl border border-surface-muted overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Author */}
      <div className="p-4 flex items-center gap-3 border-b border-surface-muted/50">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary overflow-hidden border border-surface-muted shrink-0">
          {post.author?.avatar_url
            ? <img src={`http://localhost:5000${post.author.avatar_url}`} alt={authorInitials} className="w-full h-full object-cover" />
            : authorInitials}
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">
            {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Unknown'}
          </p>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            {post.location && (
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">location_on</span>{post.location}
              </span>
            )}
            {post.location && <span>·</span>}
            <TimeAgo dateStr={post.created_at} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-on-surface mb-2 leading-snug">{post.title}</h3>
        {post.content && (
          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-3">{post.content}</p>
        )}

        {/* Images */}
        {post.images?.length > 0 && (
          <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.slice(0, 2).map((img, i) => (
              <div key={i} className="aspect-video rounded-lg overflow-hidden bg-surface-muted">
                <img
                  src={img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000${img.image_url}`}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map(t => (
              <span key={t.id} className="text-[10px] font-semibold tracking-wider bg-surface-muted text-on-surface-variant px-2 py-0.5 rounded">
                #{t.tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-4 border-t border-surface-muted/50 pt-3">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
            post.is_liked ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={post.is_liked ? { fontVariationSettings: "'FILL' 1" } : {}}>
            favorite
          </span>
          {post.likes_count}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
            post.is_saved ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={post.is_saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
            bookmark
          </span>
          {post.is_saved ? 'Saved' : 'Save'}
        </button>
        <div className="ml-auto flex items-center gap-1 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
          {post.saves_count} saves
        </div>
      </div>
    </article>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
export default function CommunitySearch() {
  const { user } = useAuth();

  const [posts,        setPosts]        = useState([]);
  const [trending,     setTrending]     = useState([]);
  const [contributors, setContributors] = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [sort,         setSort]         = useState('latest');
  const [showNewPost,  setShowNewPost]  = useState(false);
  const [error,        setError]        = useState('');

  const fetchPosts = useCallback(async (q = '', s = 'latest') => {
    setLoading(true);
    try {
      const res = await communityApi.posts({ q, sort: s, limit: 20 });
      setPosts(res.items || []);
      setTotal(res.total || 0);
    } catch {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts('', sort);
    communityApi.trending().then(setTrending).catch(() => {});
    communityApi.topContribs().then(setContributors).catch(() => {});
  }, [sort]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(searchQuery, sort);
  };

  const handleLike = async (post) => {
    if (!user) return;
    try {
      const res = post.is_liked
        ? await communityApi.unlike(post.id)
        : await communityApi.like(post.id);
      setPosts(prev => prev.map(p =>
        p.id === post.id ? { ...p, is_liked: res.liked, likes_count: res.likes_count } : p
      ));
    } catch {}
  };

  const handleSave = async (post) => {
    if (!user) return;
    try {
      const res = post.is_saved
        ? await communityApi.unsave(post.id)
        : await communityApi.save(post.id);
      setPosts(prev => prev.map(p =>
        p.id === post.id ? { ...p, is_saved: res.saved, saves_count: res.saves_count } : p
      ));
    } catch {}
  };

  // Prepend new post to feed after creation
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setTotal(t => t + 1);
  };

  return (
    <div>
      {showNewPost && (
        <CreatePostModal
          onClose={() => setShowNewPost(false)}
          onCreated={handlePostCreated}
        />
      )}

      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-3xl font-semibold text-primary">Community Hub</h2>
          {user && (
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:bg-primary transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span className="hidden sm:inline">New Post</span>
            </button>
          )}
        </div>

        {/* Search + Sort bar */}
        <div className="bg-surface-pure p-4 rounded-xl border border-surface-muted flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-surface-pure border border-surface-muted rounded-lg focus:outline-none focus:border-primary text-sm outline-none"
              placeholder="Search posts, destinations, or topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
            />
          </form>

          <div className="flex gap-2 w-full md:w-auto">
            {['latest', 'trending'].map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-colors cursor-pointer capitalize border ${
                  sort === s
                    ? 'bg-primary-container text-on-primary border-primary'
                    : 'bg-surface-muted text-on-surface-variant border-surface-muted hover:bg-surface-container-high'
                }`}
              >
                {s === 'trending' && (
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">local_fire_department</span>
                )}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feed */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">{error}</div>
          )}

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface-pure rounded-xl border border-surface-muted p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-surface-pure rounded-xl border border-surface-muted">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">forum</span>
              <p className="text-base font-semibold text-on-surface mb-1">No posts found</p>
              <p className="text-sm text-on-surface-variant mb-4">
                {searchQuery ? `Nothing matches "${searchQuery}"` : 'Be the first to share your journey!'}
              </p>
              {user && (
                <button
                  onClick={() => setShowNewPost(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:bg-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Write First Post
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-on-surface-variant">{total} post{total !== 1 ? 's' : ''}</p>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
              ))}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Write post CTA (sidebar) */}
          {user && (
            <button
              onClick={() => setShowNewPost(true)}
              className="w-full flex items-center gap-3 p-4 bg-surface-pure rounded-xl border border-surface-muted hover:border-primary hover:shadow-sm transition-all cursor-pointer text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()}
              </div>
              <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                Share your travel story…
              </span>
              <span className="ml-auto material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
                edit_note
              </span>
            </button>
          )}

          {/* Trending Destinations */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
            <h3 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">local_fire_department</span>
              Trending Destinations
            </h3>
            {trending.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No trending data yet.</p>
            ) : (
              <div className="space-y-3">
                {trending.map((dest, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-muted shrink-0">
                      {dest.cover_image_url ? (
                        <img
                          src={dest.cover_image_url.startsWith('http') ? dest.cover_image_url : `http://localhost:5000${dest.cover_image_url}`}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">location_city</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{dest.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {dest.posts_count} post{dest.posts_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Contributors */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
            <h3 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">emoji_events</span>
              Top Contributors
            </h3>
            {contributors.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {contributors.map((c, i) => {
                  const initials = `${c.user?.first_name?.[0] || ''}${c.user?.last_name?.[0] || ''}`.toUpperCase();
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                        {c.user?.avatar_url
                          ? <img src={`http://localhost:5000${c.user.avatar_url}`} alt={initials} className="w-full h-full object-cover" />
                          : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Unknown'}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {c.posts_count} post{c.posts_count !== 1 ? 's' : ''} · {c.likes_received} likes
                        </p>
                      </div>
                      <span className="text-xs font-bold text-secondary">#{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
