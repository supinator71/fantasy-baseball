import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './TradeBlock.css';

export default function TradeBlock() {
  const [activeTab, setActiveTab] = useState('market'); // 'market', 'my-block', 'offers'
  const [marketListings, setMarketListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scaffold: Fetch trade block data here
    setTimeout(() => {
      setMarketListings([
        { id: 1, player: 'Unit 91-E', user: 'CyberScout24', seeking: 'Any Legendary or Tokyo Tachyons players' },
        { id: 2, player: 'Elijah Wilson', user: 'DiamondHands', seeking: 'Brooklyn Biotics Pitchers' }
      ]);
      setLoading(false);
    }, 1000);
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
      </div>

      <div className="trade-content">
        {loading ? (
          <div className="loading" style={{ padding: 40 }}>Scanning global trade frequencies...</div>
        ) : (
          <>
            {activeTab === 'market' && (
              <div className="market-grid">
                {marketListings.map(listing => (
                  <div key={listing.id} className="trade-card-slot">
                    <div className="card-placeholder">
                      <span>Card Image Here</span>
                      <h3>{listing.player}</h3>
                    </div>
                    <div className="trade-details">
                      <div className="seller">Offered by: <strong>{listing.user}</strong></div>
                      <div className="seeking">Seeking: {listing.seeking}</div>
                      <button className="btn btn-primary make-offer-btn">Make Offer</button>
                    </div>
                  </div>
                ))}
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
          </>
        )}
      </div>
    </div>
  );
}
