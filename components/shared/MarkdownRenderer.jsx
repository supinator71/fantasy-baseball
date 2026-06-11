'use client';

import React from 'react';

export default function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = null; // 'ul' or 'ol'
  let currentListItems = [];

  const flushList = (key) => {
    if (currentList) {
      const ListTag = currentList;
      elements.push(
        <ListTag key={key} style={{ margin: '12px 0', paddingLeft: 20 }}>
          {currentListItems}
        </ListTag>
      );
      currentList = null;
      currentListItems = [];
    }
  };

  const parseInlineStyles = (txt) => {
    const parts = txt.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === '---') {
      flushList(`flush-hr-${index}`);
      elements.push(<hr key={index} style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />);
      return;
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      flushList(`flush-h1-${index}`);
      elements.push(
        <h1 key={index} style={{ fontSize: 20, fontWeight: 700, marginTop: 18, marginBottom: 8, color: '#fff' }}>
          {parseInlineStyles(trimmed.slice(2))}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(`flush-h2-${index}`);
      elements.push(
        <h2 key={index} style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 6, color: '#fff' }}>
          {parseInlineStyles(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushList(`flush-h3-${index}`);
      elements.push(
        <h3 key={index} style={{ fontSize: 14, fontWeight: 700, marginTop: 12, marginBottom: 4, color: '#fff' }}>
          {parseInlineStyles(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Bullet list items
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (currentList !== 'ul') {
        flushList(`flush-before-ul-${index}`);
        currentList = 'ul';
      }
      currentListItems.push(
        <li key={`li-${index}`} style={{ margin: '6px 0', listStyleType: 'disc', color: '#e2e8f0' }}>
          {parseInlineStyles(bulletMatch[2])}
        </li>
      );
      return;
    }

    // Numbered list items
    const numberMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (numberMatch) {
      if (currentList !== 'ol') {
        flushList(`flush-before-ol-${index}`);
        currentList = 'ol';
      }
      currentListItems.push(
        <li key={`li-${index}`} style={{ margin: '6px 0', listStyleType: 'decimal', color: '#e2e8f0' }}>
          {parseInlineStyles(numberMatch[2])}
        </li>
      );
      return;
    }

    // Empty lines
    if (trimmed === '') {
      flushList(`flush-empty-${index}`);
      return;
    }

    // Regular paragraph text
    flushList(`flush-text-${index}`);
    elements.push(
      <p key={index} style={{ margin: '8px 0 12px 0', color: '#e2e8f0', lineHeight: 1.6 }}>
        {parseInlineStyles(line)}
      </p>
    );
  });

  flushList('flush-final');

  return <div className="markdown-content">{elements}</div>;
}
