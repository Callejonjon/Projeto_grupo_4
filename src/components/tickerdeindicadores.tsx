"use client";
import React, { useEffect, useState } from 'react';

interface MarketData {
  dolar: string;
  ibovespa: string;
  selic: string;
  cdi: string;
  ipca: string;
}

export default function GiroMercado() {
  const [market, setMarket] = useState<MarketData>({
    dolar: 'Carregando...',
    ibovespa: '142.300 pts',
    selic: '15,00% a.a.',
    cdi: '14,90% a.a.',
    ipca: '4,9%'
  });

  useEffect(() => {
    // Buscando cotação real do Dólar (USD-BRL) via AwesomeAPI
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.USDBRL) {
          const bidValue = parseFloat(data.USDBRL.bid).toFixed(2).replace('.', ',');
          setMarket((prev) => ({
            ...prev,
            dolar: `R$ ${bidValue}`
          }));
        }
      })
      .catch((err) => console.error('Erro ao buscar cotação:', err));
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-4 w-full mb-6">
      <div className="flex items-center gap-2">
        <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
          Giro de Mercado
        </span>
        <span className="text-xs text-slate-600 hidden md:inline truncate max-w-md">
          Tesouro Direto bate recorde de investidoras — mulheres já são 31% da base.
        </span>
      </div>

      {/* Indicadores Compactos (Sem cliques de tradução indesejados) */}
      <div className="flex items-center gap-3 overflow-x-auto text-xs font-medium text-slate-700">
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">CDI:</span>
          <span className="font-semibold text-slate-900">{market.cdi}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">Selic:</span>
          <span className="font-semibold text-slate-900">{market.selic}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">IPCA 12m:</span>
          <span className="font-semibold text-slate-900">{market.ipca}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-500">Dólar:</span>
          <span className="font-semibold text-emerald-600">{market.dolar}</span>
        </div>
      </div>
    </div>
  );
}
