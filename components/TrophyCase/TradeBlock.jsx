import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './TradeBlock.css';

export default function TradeBlock() {
  const [activeTab, setActiveTab] = useState('market'); // 'market', 'my-block', 'offers'
  const [marketListings, setMarketListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarket() {
      try {
        const { data } = await axios.get('/api/tradeblock');
        setMarketListings(data.listings || []);
      } catch (e) {
        toast.error('Failed to load global market');
      } finally {
        setLoading(false);
      }
    }
    fetchMarket();
  }, []);

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
                <button className="btn add-to-block-btn">+ Add Card to Block</button>
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
