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
    { symbol: 'Dólar', value: 'R$ 5,43', variation: '+9.45%', isPositive: true },
    { symbol: 'Euro', value: 'R$ 6,08', variation: '+8.24%', isPositive: true },
    { symbol: 'Bitcoin', value: 'R$ 385.200', variation: '+2.40%', isPositive: true },
    { symbol: 'CDI', value: '14,90% a.a.', variation: '0.00%', isPositive: true },
    { symbol: 'Selic', value: '15,00% a.a.', variation: '0.00%', isPositive: true },
  ]);

  useEffect(() => {
    // Buscando cotações reais de Dólar e Euro via AwesomeAPI
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 w-full mb-6 text-white">
      {/* Título */}
      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
        <span className="bg-pink-600 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Giro de Mercado
        </span>
      </div>

      {/* Indicadores com ajuste automático (flex-wrap) sem barra de rolagem */}
      <div className="flex items-center justify-end flex-wrap gap-2.5 text-xs font-medium w-full">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
          >
            <span className="text-slate-400 font-semibold">{item.symbol}</span>
            <span className="text-slate-200 font-bold">{item.value}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
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
