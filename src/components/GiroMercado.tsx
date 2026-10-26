"use client";
import React, { useEffect, useState } from 'react';

interface MarketData {
  dolar: string;
  euro: string;
  ibovespa: string;
  selic: string;
  cdi: string;
  ipca: string;
}

export default function GiroMercado() {
  const [market, setMarket] = useState<MarketData>({
    dolar: 'R$ 5,45',
    euro: 'R$ 5,95',
    ibovespa: '142.300 pts',
    selic: '15,00% a.a.',
    cdi: '14,90% a.a.',
    ipca: '4,9%'
  });

  useEffect(() => {
    // Buscando cotações reais de Dólar e Euro (USD-BRL, EUR-BRL) via AwesomeAPI
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const updates: Partial<MarketData> = {};
          if (data.USDBRL) {
            updates.dolar = `R$ ${parseFloat(data.USDBRL.bid).toFixed(2).replace('.', ',')}`;
          }
          if (data.EURBRL) {
            updates.euro = `R$ ${parseFloat(data.EURBRL.bid).toFixed(2).replace('.', ',')}`;
          }
          setMarket((prev) => ({ ...prev, ...updates }));
        }
      })
      .catch((err) => console.error('Erro ao buscar cotações:', err));
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-4 w-full mb-6">
      {/* Título Principal */}
      <div className="flex items-center gap-2">
        <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap">
          Giro de Mercado
        </span>
      </div>

      {/* Indicadores Econômicos Principais (Dólar, Euro, Ibovespa, CDI, Selic, IPCA) */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium text-slate-700">
        <div className="bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">Ibov:</span>
          <span className="font-semibold text-slate-900">{market.ibovespa}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">CDI:</span>
          <span className="font-semibold text-slate-900">{market.cdi}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">Selic:</span>
          <span className="font-semibold text-slate-900">{market.selic}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">IPCA:</span>
          <span className="font-semibold text-slate-900">{market.ipca}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">Dólar:</span>
          <span className="font-semibold text-emerald-600">{market.dolar}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">Euro:</span>
          <span className="font-semibold text-emerald-600">{market.euro}</span>
        </div>
      </div>
    </div>
  );
}
