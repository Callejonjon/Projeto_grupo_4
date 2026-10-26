"use client";
import React, { useEffect, useState } from 'react';

interface MarketItem {
  symbol: string;
  value: string;
  variation: string;
  isPositive: boolean;
}

export default function GiroMercado() {
  const [items, setItems] = useState<MarketItem[]>([
    { symbol: 'Ibovespa', value: '131.450 pts', variation: '+0.75%', isPositive: true },
    { symbol: 'Dólar', value: 'R$ 5,48', variation: '-0.32%', isPositive: false },
    { symbol: 'Euro', value: 'R$ 5,98', variation: '+0.15%', isPositive: true },
    { symbol: 'Bitcoin', value: 'R$ 385.200', variation: '+2.40%', isPositive: true },
    { symbol: 'CDI', value: '14,90% a.a.', variation: '0.00%', isPositive: true },
    { symbol: 'Selic', value: '15,00% a.a.', variation: '0.00%', isPositive: true },
    { symbol: 'IFIX', value: '3.380 pts', variation: '-0.12%', isPositive: false },
  ]);

  useEffect(() => {
    // Buscando cotações reais de Dólar e Euro via AwesomeAPI para atualizar dinamicamente
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setItems((prev) =>
            prev.map((item) => {
              if (item.symbol === 'Dólar' && data.USDBRL) {
                const val = parseFloat(data.USDBRL.bid).toFixed(2).replace('.', ',');
                const pct = parseFloat(data.USDBRL.pctChange);
                return {
                  ...item,
                  value: `R$ ${val}`,
                  variation: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
                  isPositive: pct >= 0,
                };
              }
              if (item.symbol === 'Euro' && data.EURBRL) {
                const val = parseFloat(data.EURBRL.bid).toFixed(2).replace('.', ',');
                const pct = parseFloat(data.EURBRL.pctChange);
                return {
                  ...item,
                  value: `R$ ${val}`,
                  variation: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
                  isPositive: pct >= 0,
                };
              }
              return item;
            })
          );
        }
      })
      .catch((err) => console.error('Erro ao atualizar cotações:', err));
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 shadow-md flex items-center gap-4 w-full mb-6 text-white overflow-hidden">
      {/* Título Estilo InfoMoney */}
      <div className="flex items-center gap-2 border-r border-slate-700 pr-4 shrink-0">
        <span className="bg-pink-600 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Giro de Mercado
        </span>
      </div>

      {/* Lista Estilo Ticker (Rolagem horizontal fluida) */}
      <div className="flex items-center gap-6 overflow-x-auto text-xs font-medium no-scrollbar whitespace-nowrap">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">{item.symbol}</span>
            <span className="text-slate-200 font-bold">{item.value}</span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                item.isPositive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950 text-rose-400 border border-rose-800/50'
              }`}
            >
              {item.variation}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
