import { useState } from 'react';

const postsData = [
  {
    id: 1,
    author: {
      name: 'Sarah Jenkins',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTE3--LtAnmHvytjExECKxr5C0NKLjL1MFUFJBWJvKtk-RTw6xosFTO-DSOOz2HdP44QHKbOGbYayv8ccRlEodppsdVgSUJx5FVgQ4TF860MogEXYfRLMUx2RuNs2Z_kdLnCL7T6PZyznWniVg9_HbiQbQajHrVnTHycGhDoqwa6rXJv1BK4iUe4OLIPeZMMIRzbUsz3aiH2GpN98ueShVUOOXf5TdBBKAGvWVMGsprbNjGIqBKYM',
    },
    location: 'Kyoto, Japan',
    timeAgo: '2 hours ago',
    title: 'Autumn Colors in Kyoto: A 5-Day Itinerary',
    content: "Just got back from an incredible trip to Kyoto. The fall foliage was absolutely stunning. I've put together my daily schedule focusing on the lesser-known temples to avoid the crowds. Highly recommend the early morning hike up Fushimi Inari!",
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJkAylo-r7Mh0bbhrjoziU9oC_Kp3hzaCunNSW4HAJxSh5i3ODbhAg-I6mp_guMX9WBngZ3vfqN7sZGHpJbPDm_kjdf5Jkn3iZ1zcdMWG66E-T7qKU2RaraPEhHZwjH49PDfuScddj6ExHqSE_dBj97r33MA45wpH6-uAUdhsBterLY8-jfYLeM4BMp6X8v9XqxfMU5SOSFXOeBCm018J_3uVrVh90dySmf2vGMfibcv5Dd0FNbmI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDFOHL61WQ8WemdMpEGmnW1a3mzflixuQIJVTUktrV6R3IpiGl2aV0AhoPRE7ecNeam1YhcpU7uahb4YPBCn7pgOeZwKcMUI2DdSZQhCz_NCa_B9p3BG8meYk4RpW0sENlXstksVF-yI1YMt7IYWUlOc2-BB4zN_Y60LUbTYMNB2mR3lVHIjyCY4tieCXf_kgRZDECHf-9Gf8uB5T5nMZ-am2ifz2e00P85vYpddbUuJ68vv-2Ffx8',
    ],
    tags: ['Japan', 'Autumn', 'Hiking'],
    likes: 245,
    comments: 42,
  },
  {
    id: 2,
    author: {
      name: 'Marcus Thorne',
      avatar: null,
    },
    location: 'Swiss Alps',
    timeAgo: '5 hours ago',
    title: 'Minimalist Packing for 2 Weeks in Europe',
    content: 'Sharing my exact packing list that fits entirely into a 30L backpack. Traveling between climates without checking a bag changed the game for this trip.',
    itineraryPreview: [
      { days: 'Day 1-3', title: 'Zurich & Lucerne' },
      { days: 'Day 4-7', title: 'Zermatt' },
    ],
    tags: ['Europe', 'Backpacking', 'PackingTips'],
    likes: 128,
    comments: 15,
  },
];

const trendingDestinations = [
  {
    name: 'Amalfi Coast',
    country: 'Italy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvA8MXmx5PLs-Z011mcRwXWoExNQ6zOhlGNaLDWHpYC7waX5cxvp2AxeaoNDlQ1FcgTII6nm0wOrOxLUBXsCkRDkxNrAJtucjQ1qCJ6GT85ry8nqwWkesF4e9-fXc00NYbDZPXFYVYaqESfHepTwUTapZ2gzr1PCCSBCcAF8Dhghc8GsJdfhnkc4Zt1UcxF41RVQSk6TFxT0S9eGaJSvzMgK0uFDkm_qiBYxXi7wcfvYiUALeZc_E',
  },
  {
    name: 'Reykjavik',
    country: 'Iceland',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBir-CralPzAatvfl5FNhJACpgwk5TMGAfmwlZykVmjFZy_ZqZ4YpPxn7SVkqAODJgOmpc1j3lQOktaAgdf3wJpbZPRbTEZzuxQhodW8_ghOVCrUneE5CxnkYiqQBdym_zWmsGjiR9cB6ImOiKfHis-nRW3DwQOrxHvsJsSmm2eBsP-MAK71kkLfFjPaL2_mViXmWGZ6Rtg8vtlygnrUbaQ_NvmSgGCiqvVPiQutgnlWUMyRh_9ewY',
  },
  {
    name: 'Taipei',
    country: 'Taiwan',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEsDQoYHlfDJwZTNML66qse5nOvKN8nU0O6tWzfGWcco1xOwJYZAum6lEmy1Oq8saGZPuTQ_zT7qTK1zdrH7qSSHWZHCeXxlZl0Kl9hMaLIvUBEoEs1oYV2GGjDzRXFzGC3vI8r2DTvezk73bpEi_HQRlbq4t-IEoQDXY40QX_R8ioSt-OmcOpndGYudBUJCnyDr_UnoV8K8NRCh99AO2JSma-J_mAjs_F1vZkvYPs26IEwV3UMds',
  },
];

const topContributors = [
  { name: 'Alex Rivera', points: 120, initial: 'A' },
  { name: 'Elena K.', points: 95, initial: 'E' },
];

export default function CommunitySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  const toggleLike = (id) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter(item => item !== id));
    } else {
      setLikedPosts([...likedPosts, id]);
    }
  };

  const toggleSave = (id) => {
    if (savedPosts.includes(id)) {
      setSavedPosts(savedPosts.filter(item => item !== id));
    } else {
      setSavedPosts([...savedPosts, id]);
    }
  };

  const filteredPosts = postsData.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header & Search/Filter Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-primary mb-6">Community Hub</h2>
        <div className="glass-panel p-4 rounded-xl border border-surface-muted flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-surface-pure border border-surface-muted rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-on-surface placeholder:text-outline-variant outline-none" 
              placeholder="Search destinations, activities, or users..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button className="px-4 py-2 bg-surface-muted text-on-surface-variant rounded-full text-xs font-semibold tracking-wider whitespace-nowrap hover:bg-surface-container-high transition-colors cursor-pointer">
              Group by
            </button>
            <button className="px-4 py-2 bg-surface-muted text-on-surface-variant rounded-full text-xs font-semibold tracking-wider whitespace-nowrap flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
            </button>
            <button className="px-4 py-2 bg-surface-muted text-on-surface-variant rounded-full text-xs font-semibold tracking-wider whitespace-nowrap flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">sort</span> Sort by
            </button>
          </div>
        </div>
      </section>

      {/* Community Feed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const isLiked = likedPosts.includes(post.id);
              const isSaved = savedPosts.includes(post.id);
              return (
                <article key={post.id} className="bg-surface-pure rounded-xl border border-surface-muted overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 flex items-center justify-between border-b border-surface-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-surface-muted">
                        {post.author.avatar ? (
                          <img className="w-full h-full object-cover" alt={post.author.name} src={post.author.avatar} />
                        ) : (
                          <span className="material-symbols-outlined text-outline text-2xl">person</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-sm leading-tight">{post.author.name}</h4>
                        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">{post.timeAgo} • {post.location}</p>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:bg-surface-muted p-2 rounded-full transition-colors cursor-pointer">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-primary mb-2">{post.title}</h3>
                    <p className="text-sm text-on-surface leading-relaxed mb-4">{post.content}</p>
                    
                    {post.images && post.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4 h-48">
                        {post.images.map((img, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden bg-surface-muted">
                            <img className="w-full h-full object-cover" alt="Post attachment" src={img} />
                          </div>
                        ))}
                      </div>
                    )}

                    {post.itineraryPreview && (
                      <div className="bg-surface-container p-4 rounded-lg border border-surface-muted/50 space-y-3 mb-4">
                        {post.itineraryPreview.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className={`w-1 h-8 rounded-full ${idx === 0 ? 'bg-secondary' : 'bg-secondary opacity-50'}`} />
                            <div>
                              <p className="text-xs font-bold text-primary tracking-wider uppercase">{item.days}</p>
                              <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-surface-muted text-primary rounded-full text-xs font-semibold tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between border-t border-surface-muted">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1 transition-colors cursor-pointer ${
                          isLiked ? 'text-error font-semibold' : 'text-on-surface-variant hover:text-error'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]" style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                        <span className="text-xs font-semibold">{post.likes + (isLiked ? 1 : 0)}</span>
                      </button>
                      <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                        <span className="text-xs font-semibold">{post.comments}</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => toggleSave(post.id)}
                      className={`px-4 py-1.5 border rounded-lg text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
                        isSaved 
                          ? 'bg-primary-container text-on-primary border-transparent' 
                          : 'border-primary text-primary hover:bg-primary/5'
                      }`}
                    >
                      {isSaved ? 'Saved' : 'Save Itinerary'}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-12 bg-surface-pure rounded-xl border border-surface-muted">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">search_off</span>
              <p className="text-sm font-semibold text-on-surface-variant">No posts found matching your search.</p>
            </div>
          )}
        </div>

        {/* Sidebar / Widgets Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trending Destinations Card */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              Trending Destinations
            </h3>
            <ul className="space-y-4">
              {trendingDestinations.map((dest) => (
                <li key={dest.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-muted overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={dest.name} src={dest.image} />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{dest.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{dest.country}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Contributors */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Top Contributors
            </h3>
            <div className="space-y-4">
              {topContributors.map((contrib) => (
                <div key={contrib.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-teal-light text-secondary border border-secondary/20 flex items-center justify-center font-bold text-xs">
                      {contrib.initial}
                    </div>
                    <span className="text-sm font-semibold text-on-surface">{contrib.name}</span>
                  </div>
                  <span className="text-[11px] text-primary-container bg-primary-fixed border border-primary-container/20 px-2 py-0.5 rounded-full font-bold">
                    {contrib.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
