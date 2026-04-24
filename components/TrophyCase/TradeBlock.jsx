import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './TradeBlock.css';

export default function TradeBlock() {
  const [activeTab, setActiveTab] = useState('market'); // 'market', 'my-block', 'offers'
  const [marketListings, setMarketListings] = useState([]);
  const [myVault, setMyVault] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [seekingText, setSeekingText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMarket = async () => {
    try {
      const { data } = await axios.get('/api/tradeblock');
      setMarketListings(data.listings || []);
    } catch (e) {
      toast.error('Failed to load global market');
    }
  };

  const fetchVault = async () => {
    try {
      const { data } = await axios.get('/api/trophy/album');
      setMyVault(data.unlocked_cards || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchMarket(), fetchVault()]).finally(() => setLoading(false));
  }, []);

  const handlePostTrade = async () => {
    if (!selectedCard || !seekingText.trim()) return toast.error("Select a card and state what you're seeking.");
    try {
      await axios.post('/api/tradeblock', {
        instanceId: selectedCard.instanceId,
        seeking: seekingText
      });
      toast.success("Card posted to Global Market!");
      setSelectedCard(null);
      setSeekingText('');
      fetchMarket();
      setActiveTab('market');
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to post trade");
    }
  };

  return (
    <div className="trade-block-container">
      <div className="trade-header">
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>🤝 The Galactic Trade Block</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Buy, sell, and negotiate for the missing pieces of your digital collection.
          </p>
        </div>
      </div>

      <div className="trade-tabs">
        <button 
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          🌐 Global Market
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my-block' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-block')}
        >
          📦 My Trade Block
        </button>
        <button 
          className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          📩 Incoming Offers <span className="badge-count">0</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'showcases' ? 'active' : ''}`}
          onClick={() => setActiveTab('showcases')}
        >
          📖 Public Showcases
        </button>
      </div>

      <div className="trade-content">
        {loading ? (
          <div className="loading" style={{ padding: 40 }}>Scanning global trade frequencies...</div>
        ) : (
          <>
            {activeTab === 'market' && (
              <div className="market-grid">
                {marketListings.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>The Trade Block is currently empty. Post your cards to get started!</p>
                ) : (
                  marketListings.map(listing => (
                    <div key={listing.id} className="trade-card-slot">
                      <div className="card-placeholder" style={{ padding: 0, overflow: 'hidden' }}>
                        <img src={listing.card.img} alt={listing.card.playerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 'bold' }}>{listing.card.playerName}</div>
                          <div style={{ fontSize: 10, color: listing.card.teamColor || '#aaa' }}>{listing.card.rarity.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="trade-details">
                        <div className="seller">Offered by: <strong>{listing.username}</strong></div>
                        <div className="seeking">Seeking: {listing.seeking}</div>
                        <button className="btn btn-primary make-offer-btn">Make Offer</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'my-block' && (
              <div className="my-block-section">
                <p>Select cards from your Vault to place on the public Trade Block.</p>
                <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                  <div style={{ flex: 1 }}>
                    <select 
                      className="form-control" 
                      onChange={e => setSelectedCard(myVault.find(c => c.instanceId === e.target.value))}
                      value={selectedCard?.instanceId || ''}
                      style={{ background: '#0c1d35', color: '#fff', padding: 12, border: '1px solid #1e3d5c', borderRadius: 8, width: '100%', marginBottom: 16 }}
                    >
                      <option value="">-- Select a Card from your Vault --</option>
                      {myVault.map(c => (
                        <option key={c.instanceId} value={c.instanceId}>
                          {c.playerName} ({c.team}) - {c.rarity.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    
                    <input 
                      type="text" 
                      placeholder="What are you seeking in return? (e.g. 'Any Epic Pitcher')" 
                      value={seekingText}
                      onChange={e => setSeekingText(e.target.value)}
                      style={{ background: '#0c1d35', color: '#fff', padding: 12, border: '1px solid #1e3d5c', borderRadius: 8, width: '100%', marginBottom: 16 }}
                    />
                    
                    <button className="btn btn-primary" onClick={handlePostTrade} disabled={!selectedCard || !seekingText.trim()}>
                      + Post to Global Market
                    </button>
                  </div>
                  
                  <div style={{ width: 250, border: '1px dashed #1e3d5c', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    {selectedCard ? (
                      <div style={{ padding: 10, textAlign: 'center' }}>
                        <img src={selectedCard.img} alt={selectedCard.playerName} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
                        <div style={{ fontWeight: 'bold' }}>{selectedCard.playerName}</div>
                        <div style={{ fontSize: 12, color: selectedCard.teamColor || '#aaa' }}>{selectedCard.rarity.toUpperCase()}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Card Preview</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="offers-section">
                <p style={{ color: 'var(--text-muted)' }}>You have no pending trade offers.</p>
              </div>
            )}

            {activeTab === 'showcases' && (
              <div className="showcases-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <p style={{ color: 'var(--text-muted)' }}>Browse other collectors' public vaults to see their rarest pulls.</p>
                  <label className="public-toggle">
                    <input type="checkbox" defaultChecked={true} />
                    <span>Make My Collection Public</span>
                  </label>
                </div>
                
                <div className="showcase-grid">
                  <div className="showcase-user-card">
                    <div className="user-avatar">🤖</div>
                    <div className="user-info">
                      <h3>CyberScout24</h3>
                      <p>42 Unique Cards • 3 Legendaries</p>
                    </div>
                    <button className="btn btn-ghost">View Collection</button>
                  </div>
                  <div className="showcase-user-card">
                    <div className="user-avatar">👽</div>
                    <div className="user-info">
                      <h3>DiamondHands</h3>
                      <p>110 Unique Cards • 8 Legendaries</p>
                    </div>
                    <button className="btn btn-ghost">View Collection</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
